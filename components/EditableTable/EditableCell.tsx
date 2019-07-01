import React, { useState, useEffect, useRef, useContext } from 'react';
import { EditableRecord } from './interface';
import { EditableContext } from '../context';
import { Form, Input, Select, Icon } from 'antd';

function useEditing(inputRef: any): [boolean, () => void] {
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

export default function EditableCell(props: EditableRecord) {
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  const [editing, toggleEdit] = useEditing(inputRef);
  const {
    editable,
    children,
    dataIndex,
    record,
    fieldDecoratorOptions,
    editElement = <Input />,
    handleSave,
    rowIndex,
    alwaysEditing = true,
  } = props;

  function save(e: any) {
    form.validateFields((error: any, values: any) => {
      if (error && error[e.currentTarget.id]) {
        return;
      }
      !alwaysEditing && toggleEdit();
      handleSave({ ...record, ...values }, rowIndex);
    });
  }

  function generateEditProps(): any {
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

  return (
    <td {...props}>
      {editable
        ? (function() {
            // 合并options
            const decoratorOptions = {
              ...fieldDecoratorOptions,
              ...(record[dataIndex] != null ? { initialValue: record[dataIndex] } : {}),
            };

            const editProps = generateEditProps();

            const formContent =
              alwaysEditing || editing ? (
                React.cloneElement(editElement, {
                  ref: inputRef,
                  ...editProps,
                })
              ) : (
                <div
                  onClick={() => {
                    toggleEdit();
                  }}
                  className="editable-table-cell-value-wrap"
                  style={{ paddingRight: 24 }}
                >
                  <Icon type="edit" />
                  {children}
                </div>
              );

            return (
              <Form.Item style={{ margin: 0 }}>
                {form.getFieldDecorator(dataIndex, decoratorOptions)(formContent)}
              </Form.Item>
            );
          })()
        : children}
    </td>
  );
}
