import React from 'react';
import { connect } from 'dva';
import uuid from 'uuid';
import { Form, Input, Button, Select, Row, Col } from 'antd';
import styles from './eg1.css';

const FormItem = Form.Item;
const Option = Select.Option;

@Form.create()
class Page extends React.Component{
  constructor() {
    super();
    this.state = {
      backups: [],
      conditionData: [
        { name: '逾期天数', value: 'overdue_days', disabled: false },
        { name: '产品名称', value: 'product_code', disabled: false },
        { name: '商户', value: 'merchant', disabled: false },
        { name: '地域', value: 'area', disabled: false },
        { name: '贷中评分', value: 'score', disabled: false },
        { name: '标签属性', value: 'tag', disabled: false },
        { name: '委案状态', value: 'entruStatus', disabled: false },
        { name: '是否核销', value: 'cancel', disabled: false }
      ],
      deciedList: [
        { name: 'between', value: 'between' },
        { name: '!=', value: '!=' },
        { name: '=', value: '=' },
        { name: '>', value: '>' },
        { name: '<', value: '<' },
        { name: '>=', value: '>=' },
        { name: '<=', value: '<=' },
      ],
      firstVal: {},
      secondVal: {},
      newArr: []
    }
  }

  // 表单提交
  handleSubmit = (e) => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        console.log(values);
      }
    });

  }

  // 添加
  add = () => {
    const { form } = this.props;
    const list = form.getFieldValue('list');
    const nextList = list.concat({id: uuid.v4()});
    const content = form.getFieldValue('content');
    const { conditionData } = this.state;
    form.setFieldsValue({
      list: nextList,
    });

    console.log(list, 'add-----', content)

    // content.length && content.map((item, index) => {
    //   if (item.left) {
    //       let newData = conditionData.filter(val => val.value !== item.left);
    //       this.setState({
    //           conditionData: newData
    //       });
    //   }
    // });
  }

  // 删除
  deleteRow = (index) => {
    const { form, form: { setFieldsValue } } = this.props;
    const list = form.getFieldValue('list');
    const content = form.getFieldValue('content');

    if (list.length === 1) {
      return;
    }
    console.log(list, '111-----', content)
    list.splice(index, 1);
    content.splice(index, 1);
    form.setFieldsValue({
      list, content
      // list: list.filter((item, key) => key !== index),
      // content: content.filter((item, key) => key !== index),
    });


    // content.length && content.map((item, index) => {
    //   setFieldsValue({ [`content[${index}].left`]: item.left });
    //   setFieldsValue({ [`content[${index}].flag`]: item.flag });
    //   setFieldsValue({ [`content[${index}].value1`]: item.value1 });
    // });

    console.log(list, '222-----', content)

  }

  selOnBlurItem = (value, index) => {
    const { form: { getFieldValue } } = this.props;
    const { conditionData, backups } = this.state;
    const content = getFieldValue('content');
    const list = getFieldValue('list');

    console.log(backups, 'content----', content);
    this.setState({
        conditionData: [...conditionData, ...backups]
    });
    if (list.length === backups.length) {
        return;
    }
    content && content.forEach((item1, index1, arr1) => {
        if (index1 !== index) {
            conditionData.forEach((item2, index2, arr2) => {
                if (item1.left === item2.value) {
                    backups.push(conditionData.splice(index2, 1)[0]);
                }

                console.log(backups, 'backups')
            })
        }
    });

    console.log("conditionFocus", conditionData, backups);

    this.setState({
        conditionData,
        backups
    });
  }

  selRuleItem = (value, index) => {
    const { form: { getFieldValue, getFieldDecorator } } = this.props;
    let val = getFieldValue(`content[${index}].flag`);
    let arr = [];
    let obj = {};
    
    if (value === 'overdue_days' || value === 'score') {
      obj['a'] = value;
      obj['b'] = val;
    } else {
      obj['a'] = value;
      obj['b'] = '=';
    }
    let arrObj = arr.push(obj);
    this.setState({
      newArr: [...this.state.newArr, ...arr]
    });
    console.log(this.genertorForm(), '--------');
    // this.genertorForm();
  }

  genertorForm = () => {
    const { newArr } = this.state;
    const { form: { getFieldValue, getFieldDecorator } } = this.props;
    newArr.map((item, index) => {
      let fieldName1 = `content[${index}].value1`;
      let fieldName2 = `content[${index}].value2`;
      switch(item && item.a) {
        case 'overdue_days || score':
        return (
          <Row>
            {item.b === 'between' ? 
            <Col span={6}>
            <FormItem label='' >
              {getFieldDecorator(fieldName1, {
                rules: [{
                required: true,
                message: "名称不能为空！",
                }],
                initialValue: ''
              })(
                <Input placeholder="请输入名称" style={{ width: '60%', marginRight: 8 }} />
            )}
            </FormItem>
            <FormItem label='' >
              {getFieldDecorator(fieldName2, {
                rules: [{
                required: true,
                message: "名称不能为空！",
                }],
                initialValue: ''
              })(
                  <Input placeholder="请输入名称" style={{ width: '60%', marginRight: 8 }} />
            )}
      </FormItem>
    </Col> : <Col span={6}>
          <FormItem label='' >
            {getFieldDecorator(fieldName1, {
              rules: [{
              required: true,
              message: "名称不能为空！",
              }],
              initialValue: ''
            })(
            <Input placeholder="88" style={{ width: '60%', marginRight: 8 }} />
          )}
          </FormItem>
        </Col>}
          </Row>
        )
        break;
        case 'area':
        return (<Col span={6}>
          <FormItem label='' >
            {getFieldDecorator(fieldName1, {
              rules: [{
              required: true,
              message: "名称不能为空！",
              }],
              initialValue: ''
            })(
            <Input placeholder="88" style={{ width: '60%', marginRight: 8 }} />
          )}
          </FormItem>
        </Col>)
        break;
        case 'area':
        return (<Col span={6}>
          <FormItem label='' >
            {getFieldDecorator(fieldName1, {
              rules: [{
              required: true,
              message: "名称不能为空！",
              }],
              initialValue: ''
            })(
            <Input placeholder="77" style={{ width: '60%', marginRight: 8 }} />
          )}
          </FormItem>
        </Col>)
        break;
        default:
        break;
      }
    });

  }

  render() {
    const { form: {getFieldDecorator, getFieldValue} } = this.props;
    const { conditionData, deciedList, newArr } = this.state;
    getFieldDecorator('list', { initialValue: [{id: uuid.v4()}] });
    const list = getFieldValue('list');

    const listContent = list.map((item, index) => {
      getFieldDecorator(`content[${index}].id`, {initialValue: uuid.v4()})

      console.log(newArr, 'newArr------')
      return (
        <div key={index}>
          <Row gutter={16}>
            <Col span={6}>
              <FormItem label='' >
                {getFieldDecorator(`content[${index}].left`, {
                  rules: [{
                  required: true,
                  message: "名称不能为空！",
                  }],
                  initialValue: ''
                })(
                  <Select placeholder='请选择'
                  // onFocus={(value) => this.selOnBlurItem(value, index)}
                  onChange={(value) => this.selRuleItem(value, index)}
                  >
                    {conditionData.map(item =>(<Option value={item.value} key={item.value} disabled={item.disabled}>{item.name}</Option>))}
                </Select>
                )}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label='' >
                {getFieldDecorator(`content[${index}].flag`, {
                  rules: [{
                  required: true,
                  message: "名称不能为空！",
                  }],
                  initialValue: 'between'
                })(
                <Select placeholder='请选择'>
                    {deciedList.map(item =>(<Option value={item.value} key={item.value}>{item.name}</Option>))}
                </Select>
              )}
              </FormItem>
            </Col>
            {/* <Col span={6}>
              <FormItem label='' >
                {getFieldDecorator(`content[${index}].value1`, {
                  rules: [{
                  required: true,
                  message: "名称不能为空！",
                  }],
                  initialValue: ''
                })(
                <Input placeholder="请输入名称" style={{ width: '60%', marginRight: 8 }} />
              )}
              </FormItem>
            </Col> */}
            {this.genertorForm()}
            <Col span={1}>
              <FormItem label='' >
                {index > 0 ? (
                    <Button type="primary" onClick={() => this.deleteRow(index)}>删除</Button>
                ) : null}
              </FormItem>
            </Col>
          </Row>
        </div>
      );
    });
    return (
      <div className={styles.normal}>
          <Form onSubmit={this.handleSubmit}>
            <FormItem style={{marginLeft: 540}}>
              {/* <Button type="primary" htmlType="submit">提交</Button> */}
              <Button type="primary" style={{ marginLeft: '10px' }} onClick={this.add}>增加</Button>
            </FormItem>
            {listContent}
          </Form>
      </div>
    );
  }
}

export default connect()(Page);
