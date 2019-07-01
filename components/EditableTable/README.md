有完整校验功能的可编辑表格

## 何时使用

- 表格内容需要编辑的时候
- 表格内容需要校验的时候
- 需要新增、删除表格行的时候

## 如何使用

```jsx
// usage1: controlled-component

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

```jsx
// usage2: uncontrolled-component
const tableRef = useRef()

// when need to commit
handleSave() {
  const { validateTableFields } = tableRef.current
  validateTableFields((errors, values) => {
    if(!errors) {
      // use values
    }
  })
}

<EditableTable
  ref={tableRef}
  columns={columns}
  dataSource={dataSource}
></EditableTable>
```

## API

### Table

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| 所有 antd table 的参数 | - | - | - |
| controlled | 是否使用控制型组件，如果`controlled=false`，那么将不会触发 onDataSync 和 onRecord，同时请通过 validateTableFields 来获取最新的 dataSource 数据 | boolean | true |
| columns | 新增几个配置属性，详情见 columns | - | - |
| addText | 自带的新增 row 的 button 的 text | string or ReactNode | +添加 |
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
| editElement | 必填用于编辑字段内容的组件，目前只支持 `<Input /> or <Select />` | ReactElement | `<Input />` |

### Table Ref

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| validateTableFields | 用法同 validateFields，验证 table 中所有表单项 | --- | --- |
| resetTableFields | 用法同 resetFields，重置 table 中所有表单项 | --- | --- |
| resetTable | 有时候会遇到 resetFields 依旧无法重置的情况，使用 resetTable 直接重置整个 table 组件。同时会触发 onDataSync。 | () => void | --- |
| addRow | 如果设置了`hideAddBtn=true`则可以通过这个方法添加表的行 | --- | --- |
| deleteRow | 通过传入 rowIndex 来删除行，同时触发 onDataSync | (rowIndex) => void | --- |
