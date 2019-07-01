(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react'), require('antd')) :
    typeof define === 'function' && define.amd ? define(['exports', 'react', 'antd'], factory) :
    (global = global || self, factory(global.umd = {}, global.react, global.antd));
}(this, function (exports, React, antd) { 'use strict';

    var React__default = 'default' in React ? React['default'] : React;

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

    const EditableContext = React__default.createContext(null);

    function useEditing(inputRef) {
        const [editing, setEditing] = React.useState(false);
        function toggleEdit() {
            setEditing(!editing);
        }
        React.useEffect(() => {
            const inputElm = inputRef.current;
            if (editing) {
                inputElm && inputElm.focus();
            }
        });
        return [editing, toggleEdit];
    }
    function EditableCell(props) {
        const inputRef = React.useRef(null);
        const form = React.useContext(EditableContext);
        const [editing, toggleEdit] = useEditing(inputRef);
        const { editable, children, dataIndex, record, fieldDecoratorOptions, editElement = React__default.createElement(antd.Input, null), handleSave, rowIndex, alwaysEditing = true, } = props;
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
                case antd.Input:
                    return {
                        onBlur: save,
                        onPressEnter: save,
                    };
                case antd.Select:
                default:
                    return {
                        onBlur: save,
                    };
            }
        }
        return (React__default.createElement("td", Object.assign({}, props), editable
            ? (function () {
                // 合并options
                const decoratorOptions = Object.assign({}, fieldDecoratorOptions, (record[dataIndex] != null ? { initialValue: record[dataIndex] } : {}));
                const editProps = generateEditProps();
                const formContent = alwaysEditing || editing ? (React__default.cloneElement(editElement, Object.assign({ ref: inputRef }, editProps))) : (React__default.createElement("div", { onClick: () => {
                        toggleEdit();
                    }, className: "editable-table-cell-value-wrap", style: { paddingRight: 24 } },
                    React__default.createElement(antd.Icon, { type: "edit" }),
                    children));
                return (React__default.createElement(antd.Form.Item, { style: { margin: 0 } }, form.getFieldDecorator(dataIndex, decoratorOptions)(formContent)));
            })()
            : children));
    }

    var EditableRow = antd.Form.create()(function EditableRow(_a) {
        var { form } = _a, props = __rest(_a, ["form"]);
        const { rowRef } = props;
        React.useImperativeHandle(rowRef, () => form);
        return (React__default.createElement(EditableContext.Provider, { value: form },
            React__default.createElement("tr", Object.assign({}, props))));
    });

    function useReset() {
        const [uid, setUID] = React.useState(0);
        function reset() {
            setUID(uid + 1);
        }
        return [uid, reset];
    }
    function useInitialValue(value) {
        const initialValue = React.useRef(value);
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
    function createFunctions(props, controlledDataSource) {
        const { dataSource, columns, onDataSync, onRecordSync, controlled } = props;
        function sync(data, rowIndex) {
            if (controlled) {
                data = data;
                controlledDataSource.splice(0, controlledDataSource.length);
                controlledDataSource.push(...data);
            }
            else if (rowIndex != null) {
                data = data;
                onRecordSync && onRecordSync(data, rowIndex);
            }
            else {
                data = data;
                onDataSync && onDataSync(data);
            }
        }
        function handleSave(newRecord, rowIndex) {
            const newData = [...dataSource];
            newData.splice(rowIndex, 1, newRecord);
            sync(newRecord, rowIndex);
            sync(newData);
        }
        function handleAdd() {
            const newRecord = createRecord(columns);
            const newData = dataSource.slice();
            newData.push(newRecord);
            sync(newRecord, dataSource.length);
            sync(newData);
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
            sync,
        };
    }
    var EditableTable = React__default.forwardRef(function EditableTable(props, ref) {
        const { columns, dataSource, onDataSync, addText, hideAddBtn } = props, restProps = __rest(props, ["columns", "dataSource", "onDataSync", "addText", "hideAddBtn"]);
        const [uid, resetComponent] = useReset();
        const initialDataSource = useInitialValue(dataSource);
        // slice一份儿dataSource作为controlled state
        const controlledDataSource = useInitialValue(dataSource.slice());
        const { handleAdd, generateColumns, sync } = React__default.useMemo(() => createFunctions(props, controlledDataSource), [dataSource, onDataSync]);
        const generatedColumns = generateColumns(columns);
        // 这里的写法是没错的, 因为dataSource会发生变化
        // 如果使用useRef(dataSource.map(_ => React.createRef()),那么它的结果只会是一个空数组(初始值)
        const rowRefs = dataSource.map(_ => React__default.createRef());
        React__default.useImperativeHandle(ref, () => ({
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
                if (errors.length) {
                    handler(errors);
                }
                else {
                    handler(null, initialDataSource);
                }
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
                sync(initialDataSource);
            },
            addRow() {
                handleAdd();
            },
            deleteRow(rowIndex) {
                const newData = dataSource.slice();
                newData.splice(rowIndex, 1);
                sync(newData);
            },
        }));
        return (React__default.createElement("div", null,
            !hideAddBtn && React__default.createElement("a", { onClick: handleAdd }, addText || '+添加'),
            React__default.createElement(antd.Table, Object.assign({ key: uid, rowClassName: () => 'editable-table-row', components: components, columns: generatedColumns, dataSource: dataSource, onRow: (_, index) => {
                    return {
                        rowRef: rowRefs[index],
                    };
                }, pagination: { hideOnSinglePage: true } }, restProps))));
    });

    exports.EditableTable = EditableTable;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
