import React, { useRef, useContext, useState, useEffect, useImperativeHandle } from 'react';
import { Icon, Form, Input, Select, Table } from 'antd';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

const EditableContext = React.createContext(null);

function useEditing(inputRef) {
    const [editing, setEditing] = useState(false);
    function toggleEdit() {
        setEditing(!editing);
    }
    useEffect(() => {
        const inputElm = inputRef.current;
        if (editing) {
            inputElm && inputElm.focus();
        }
    });
    return [editing, toggleEdit];
}
function EditableCell(props) {
    const inputRef = useRef(null);
    const form = useContext(EditableContext);
    const [editing, toggleEdit] = useEditing(inputRef);
    const { editable, children, dataIndex, record, fieldDecoratorOptions, editElement, handleSave, rowIndex, alwaysEditing = true, } = props;
    function save(e) {
        form.validateFields((error, values) => {
            if (error && error[e.currentTarget.id]) {
                return;
            }
            !alwaysEditing && toggleEdit();
            handleSave(Object.assign({}, record, values), rowIndex);
        });
    }
    function generateEditProps() {
        switch (editElement.type) {
            case Input:
                return {
                    onBlur: save,
                    onPressEnter: save,
                };
            case Select:
            default:
                return {
                    onBlur: save,
                };
        }
    }
    return (React.createElement("td", Object.assign({}, props), editable
        ? (function () {
            // 合并options
            const decoratorOptions = Object.assign({}, fieldDecoratorOptions, (record[dataIndex] != null ? { initialValue: record[dataIndex] } : {}));
            const editProps = generateEditProps();
            const formContent = alwaysEditing || editing ? (React.cloneElement(editElement, Object.assign({ ref: inputRef }, editProps))) : (React.createElement("div", { onClick: () => {
                    toggleEdit();
                }, className: "editable-table-cell-value-wrap", style: { paddingRight: 24 } },
                React.createElement(Icon, { type: "edit" }),
                children));
            return (React.createElement(Form.Item, { style: { margin: 0 } }, form.getFieldDecorator(dataIndex, decoratorOptions)(formContent)));
        })()
        : children));
}

var EditableRow = Form.create()(function EditableRow(_a) {
    var { form } = _a, props = __rest(_a, ["form"]);
    const { rowRef } = props;
    useImperativeHandle(rowRef, () => form);
    return (React.createElement(EditableContext.Provider, { value: form },
        React.createElement("tr", Object.assign({}, props))));
});

function useReset() {
    const [uid, setUID] = useState(0);
    function reset() {
        setUID(uid + 1);
    }
    return [uid, reset];
}
function useInitialValue(value) {
    const initialValue = useRef(value);
    return initialValue.current;
}

const components = {
    body: {
        row: EditableRow,
        cell: EditableCell,
    },
};
function createRecord(columns) {
    return columns
        .map(column => {
        const { dataIndex, fieldDecoratorOptions = {} } = column;
        return {
            dataIndex,
            initialValue: fieldDecoratorOptions.initialValue || null,
        };
    })
        .reduce((item, next) => {
        if (next.dataIndex) {
            item[next.dataIndex] = next.initialValue;
        }
        return item;
    }, {});
}
function createFunctions(props) {
    const { dataSource, columns, onDataSync, onRecordSync } = props;
    function handleSave(newRecord, rowIndex) {
        const newData = [...dataSource];
        newData.splice(rowIndex, 1, newRecord);
        onRecordSync && onRecordSync(newRecord, rowIndex);
        onDataSync && onDataSync(newData);
    }
    function handleAdd() {
        const newRecord = createRecord(columns);
        const newData = dataSource.slice();
        newData.push(newRecord);
        onRecordSync && onRecordSync(newRecord, dataSource.length);
        onDataSync && onDataSync(newData);
    }
    function generateColumns(columns) {
        return columns.map(column => {
            if (!column.editable) {
                return column;
            }
            return Object.assign({}, column, { onCell: (record, rowIndex) => (Object.assign({ record,
                    handleSave,
                    rowIndex }, column)) });
        });
    }
    return {
        handleSave,
        handleAdd,
        generateColumns,
    };
}
var EditableTable = React.forwardRef(function EditableTable(props, ref) {
    const { columns, dataSource, onDataSync, addText, hideAddBtn } = props, restProps = __rest(props, ["columns", "dataSource", "onDataSync", "addText", "hideAddBtn"]);
    const [uid, resetComponent] = useReset();
    const initialDataSource = useInitialValue(dataSource);
    const { handleAdd, generateColumns } = React.useMemo(() => createFunctions(props), [
        dataSource,
        onDataSync,
    ]);
    const generatedColumns = generateColumns(columns);
    // 这里的写法是没错的, 因为dataSource会发生变化
    // 如果使用useRef(dataSource.map(_ => React.createRef()),那么它的结果只会是一个空数组(初始值)
    const rowRefs = dataSource.map(_ => React.createRef());
    React.useImperativeHandle(ref, () => ({
        validateTableFields(handler) {
            const errors = [];
            rowRefs.forEach(ref => {
                const form = ref.current;
                form.validateFields(error => {
                    if (error) {
                        errors.push(error);
                    }
                });
            });
            handler(errors.length ? errors : null);
        },
        // 这个方法的语义是: 清空所有table-row中form的field值
        // 也就是说,如果你默认有一行,然后又加了一行,执行这个方法,不会删掉第二行,而是重置这两行的fields
        resetTableFields() {
            rowRefs.forEach(ref => {
                const form = ref.current;
                form.resetFields();
            });
        },
        // 使用uid重置，但是用户要确保sourceData也被重置了
        resetTable() {
            resetComponent();
            onDataSync && onDataSync(initialDataSource);
        },
        addRow() {
            handleAdd();
        },
        deleteRow(rowIndex) {
            const newData = dataSource.slice();
            newData.splice(rowIndex, 1);
            onDataSync && onDataSync(newData);
        },
    }));
    return (React.createElement("div", null,
        !hideAddBtn && React.createElement("a", { onClick: handleAdd }, addText || '+添加'),
        React.createElement(Table, Object.assign({ key: uid, rowClassName: () => 'editable-table-row', components: components, columns: generatedColumns, dataSource: dataSource, onRow: (_, index) => {
                return {
                    rowRef: rowRefs[index],
                };
            }, pagination: { hideOnSinglePage: true } }, restProps))));
});

export { EditableTable };