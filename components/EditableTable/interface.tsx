import * as React from 'react';
import { ColumnProps, TableProps } from 'antd/es/table';
import { GetFieldDecoratorOptions } from 'antd/es/form/Form';
import { Input, Select } from 'antd';

export type EditableRecord = any;

export interface EditableTableProps<T = EditableRecord> extends TableProps<T> {
  onRecordSync?: (newRecord: T, index: number) => void;
  onDataSync?: (newDataSource: Array<T>) => void;
  columns: Array<EditableColumnProps<T>>;
  dataSource: Array<T>;
  addText?: React.ReactNode;
  hideAddBtn?: boolean;
}

// 怎么用ts限定只用Input和Select?
export type EditableElement = React.ReactNode;
// TODO: 这里需要有个限制,比如: editable是可选的,但是一旦选了,就得选editElement
// 看onenote里的备忘录-6-25

export interface EditableColumnProps<T = EditableRecord> extends ColumnProps<T> {
  fieldDecoratorOptions?: GetFieldDecoratorOptions;
  editable?: boolean;
  editElement?: EditableElement;
  alwaysEditing?: boolean;
}
