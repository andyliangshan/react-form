import React from 'react';
import { connect } from 'dva';
import { Form, Input, Button } from 'antd';
import styles from './eg2.css';

const FormItem = Form.Item;

function Page(props) {
  const { form } = props;
  const { getFieldDecorator, getFieldValue } = form

  // 表单提交
  const handleSubmit = (e) => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        console.log(values);
      }
    });

  }

  // 添加
  const add = () => {
    const list = form.getFieldValue('list');
    const nextList = list.concat({});
    form.setFieldsValue({
      list: nextList,
    });


  }

  // 删除
  const deleteRow = (index) => {
    const list = form.getFieldValue('list');
    const content = form.getFieldValue('content');

    if (list.length === 1) {
      return;
    }

    form.setFieldsValue({
      list: list.filter((item, key) => key !== index),
      content: content.filter((item, key) => key !== index),
    });



  }


  const slist = [{
    id:'0001',
    name: '黎明'
  }, {
    id:'0002',
    name: '晴天'
  }]
  getFieldDecorator('list', { initialValue: slist });
  const list = getFieldValue('list');

  console.log(list, 'list----')
  const listContent = list.map((item, index) => {
    getFieldDecorator(`content[${index}].id`, {initialValue: item.id || ''})
    return (
      <FormItem label='名称：' key={index}>
      {getFieldDecorator(`content[${index}].name`, {
         rules: [{
         required: true,
         message: "名称不能为空！",
         }],
         initialValue: item.name || ''
      })(
         <Input placeholder="请输入名称" style={{ width: '60%', marginRight: 8 }} />
      )}

       {index > 0 ? (
           <Button type="primary" onClick={deleteRow.bind(this, index)}>删除</Button>
       ) : null}


      </FormItem>
    );
  });


  return (
    <div className={styles.normal}>
        <Form onSubmit={handleSubmit}>

        {listContent}
        <FormItem>
          <Button type="primary" htmlType="submit">提交</Button>
          <Button type="primary" style={{ marginLeft: '10px' }} onClick={add}>增加</Button>
        </FormItem>
      </Form>

    </div>
  );
}


const page = Form.create()(Page);
export default connect()(page);
