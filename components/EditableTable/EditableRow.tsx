import React, { useImperativeHandle } from 'react';
import { EditableContext } from '../context';
import { Form } from 'antd';
export default Form.create()(function EditableRow({ form, ...props }: any) {
  const { rowRef } = props;
  useImperativeHandle(rowRef, () => form);
  return (
    <EditableContext.Provider value={form}>
      <tr {...props} />
    </EditableContext.Provider>
  );
});
