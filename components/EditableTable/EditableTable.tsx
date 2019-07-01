import React, { useRef, useState } from 'react';
import { Table } from 'antd';
import { EditableTableProps, EditableRecord, EditableColumnProps } from './interface';
import EditableCell from './EditableCell';
import EditableRow from './EditableRow';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { useInitialValue, useReset } from '../util';

const components = {
  body: {
    row: EditableRow,
    cell: EditableCell,
  },
};

function createRecord(columns: Array<EditableColumnProps>) {
  return columns
    .map(column => {
      const { dataIndex, fieldDecoratorOptions = {} } = column;
      return {
        dataIndex,
        initialValue: fieldDecoratorOptions.initialValue || null,
      };
    })
    .reduce(
      (item, next) => {
        if (next.dataIndex) {
          item[next.dataIndex!] = next.initialValue;
        }
        return item;
      },
      {} as any,
    );
}

function createFunctions<T = EditableRecord>(
  props: EditableTableProps<T>,
  controlledTuple: Array<any>,
) {
  const [controlledDataSource, setControlledDataSource] = controlledTuple;
  const { dataSource, columns, onDataSync, onRecordSync, controlled = true } = props;
  const tableDataSource = controlled ? dataSource : controlledDataSource;

  function sync(data: T | Array<T>, rowIndex?: number) {
    if (rowIndex != null) {
      data = data as T;
      if (!controlled) {
        const newData = tableDataSource.slice();
        newData[rowIndex] = data;
        setControlledDataSource(newData);
      } else {
        onRecordSync && onRecordSync(data, rowIndex);
      }
    } else {
      data = data as Array<T>;
      if (!controlled) {
        setControlledDataSource(data);
      } else {
        onDataSync && onDataSync(data);
      }
    }
  }

  function handleSave(newRecord: T, rowIndex: number) {
    const newData = [...tableDataSource];
    newData.splice(rowIndex, 1, newRecord);
    sync(newRecord, rowIndex);
    sync(newData);
  }

  function handleAdd() {
    const newRecord = createRecord(columns);
    const newData = tableDataSource.slice();
    newData.push(newRecord);

    sync(newRecord, tableDataSource.length);
    sync(newData);
  }

  function generateColumns<T>(columns: Array<EditableColumnProps<T>>) {
    return columns.map(column => {
      if (!column.editable) {
        return column;
      }
      return {
        ...column,
        onCell: (record: T, rowIndex: number) => ({
          record,
          handleSave,
          rowIndex,
          ...column,
        }),
      };
    });
  }

  return {
    handleSave,
    handleAdd,
    generateColumns,
    sync,
  };
}

export default React.forwardRef(function EditableTable<T extends EditableRecord>(
  props: EditableTableProps<T>,
  ref: any,
) {
  const { columns, dataSource, onDataSync, addText, hideAddBtn, controlled, ...restProps } = props;

  const [uid, resetComponent] = useReset();
  const initialDataSource = useInitialValue(dataSource);
  // slice一份儿dataSource作为controlled state
  const controlledTuple = useState(dataSource.slice());
  const [controlledDataSource] = controlledTuple;

  // 从这里开始，统一使用tableDataSource来表示真实的dataSource
  const tableDataSource = controlled ? dataSource : controlledDataSource;

  const { handleAdd, generateColumns, sync } = createFunctions(props, controlledTuple);
  const generatedColumns = generateColumns<T>(columns);

  // 这里的写法是没错的, 因为dataSource会发生变化
  // 如果使用useRef(dataSource.map(_ => React.createRef()),那么它的结果只会是一个空数组(初始值)
  const rowRefs = tableDataSource.map(_ => React.createRef<WrappedFormUtils>());

  React.useImperativeHandle(ref, () => ({
    validateTableFields(handler: (errors?: any[] | null, values?: any) => void) {
      const errors: any[] = [];
      rowRefs.forEach(ref => {
        const form = ref.current;
        form!.validateFields(error => {
          if (error) {
            errors.push(error);
          }
        });
      });
      if (errors.length) {
        handler(errors);
      } else {
        handler(null, tableDataSource);
      }
    },
    // 这个方法的语义是: 清空所有table-row中form的field值
    // 也就是说,如果你默认有一行,然后又加了一行,执行这个方法,不会删掉第二行,而是重置这两行的fields
    resetTableFields() {
      rowRefs.forEach(ref => {
        const form = ref.current;
        form!.resetFields();
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
    deleteRow(rowIndex: number) {
      const newData = tableDataSource.slice();
      newData.splice(rowIndex, 1);
      sync(newData);
    },
  }));

  return (
    <div>
      {!hideAddBtn && <a onClick={handleAdd}>{addText || '+添加'}</a>}
      <Table
        key={uid}
        rowClassName={() => 'editable-table-row'}
        components={components}
        columns={generatedColumns}
        dataSource={tableDataSource}
        onRow={(_, index) => {
          return {
            rowRef: rowRefs[index],
          };
        }}
        pagination={{ hideOnSinglePage: true }}
        {...restProps}
      />
    </div>
  );
});
