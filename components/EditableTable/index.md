有完整校验功能的可编辑表格

## 何时使用

- 表格内容需要编辑的时候
- 表格内容需要校验的时候
- 需要新增、删除表格行的时候

## 如何使用

```jsx
const columns = [
  {
    title: '字段名称',
    dataIndex: 'columnName',
    editable: true,
    editElement: <Input></Input>,
    fieldDecoratorOptions: {
      rules: [
        {
          required: true,
          message: '请输入字段名称',
        },
      ],
    },
  },
  {
    title: '注释',
    dataIndex: 'remarks',
    editable: true,
    editElement: <Input></Input>,
  },
]

const dataSource = []

<EditableTable
  columns={columns}
  dataSource={dataSource}
  onDataSync={(newDataSource) => {
    // here we need sync newDataSource to state
    // using setState or hooks
  }}
></EditableTable>
```

## API

### Table

| 参数                     | 说明 | 类型 | 默认值 |
| ------------------------ | ---- | ---- | ------ |
| 所有 antd table 的 props | -    | -    | -      |
