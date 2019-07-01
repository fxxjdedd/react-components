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

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| 所有 antd table 的参数 | - | - | - |
| columns | 新增几个配置属性，详情见 columns | - | - |
| addText | 自带的新增 row 的 button 的 text | string \| ReactNode | +添加 |
| hideAddBtn | 是否隐藏自带的新增 row 的 button，使用自定义的增加方式 | boolean | false |
| onDataSync | 每次编辑内容变化都会触发 onDataSync 回调，参数是编辑后的新 dataSource | (newDataSource) => void | null |
| onRecordSync | 每次编辑内容变化都会触发 onRecordSync 回调，参数是所编辑行的新 Record 以及 rowIndex | (newRecord, rowIndex) => void | null |

注：如果同时存在 onDataSync 和 onRecordSync，他们都会被触发，并且 onRecordSync 会先触发。

### Columns

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| fieldDecoratorOptions | 同 getFieldDecorator 的第二个参数 | - | - |
| editable | table-cell 是否可编辑 | boolean | false |
| alwaysEditing | table-cell 是否一直处于可编辑状态，如果为 false 需要点击一下才会切换到编辑状态 | boolean | false |
| editElement | 必填用于编辑字段内容的组件，目前只支持`<Input />|<Select />` | ReactElement | `<Input />` |
