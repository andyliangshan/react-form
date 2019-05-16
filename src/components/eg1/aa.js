import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { Form, Input, Select, Row, Col, DatePicker, Button, Table, Popconfirm, TimePicker, Icon, message, TreeSelect, Modal } from 'antd';
import optionsApi from 'api/options';
import { fetchCityListByProvinceCode } from 'api/city';
import moment from 'moment';
import styles from './style.css';
const FormItem = Form.Item;
const Option = Select.Option;

const conditionData = [
    { name: '逾期天数', value: 'overdue_days' },
    { name: '产品名称', value: 'product_code' },
    { name: '商户', value: 'merchant' },
    { name: '地域', value: 'area' },
    { name: '贷中评分', value: 'score' },
    { name: '标签属性', value: 'tag' },
    { name: '委案状态', value: 'entruStatus' },
    { name: '是否核销', value: 'cancel' }
];
const cancelList = [{ "status": '1', "desc": '是' }, { "status": '2', "desc": '否' }]; // 是否核销
let uuid = 1;
let newFlag = {};
let newIsShow = {};
let newType = {};
let newData = {};
class ChildRules extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            // 结果集
            typeSelObj: {},
            // obj
            selAllList: [], // 当前下拉列表值
            cityListOptions: [],
            cityCode: [],
            detailStatus: false, // 非查看状态下文本框可点,
            currDecied: {}, // 当前第二个选择条件判断框
            isShowSel: {}, // 当前第三个条件
        };
    }

    static propTypes = {
        form: PropTypes.object
    }

    componentDidMount() { }

    componentWillReceiveProps(nextPros) {
        if ((nextPros.title === '编辑分案策略' || nextPros.title === '查看详情') && nextPros.listRes) {
            nextPros.listRes && nextPros.listRes.strategyResultFilters.forEach((item, k) => {
                this.fetchSelList(item.left, k);
            });
            this.setState({
                currDecied: this.dateFlagReverse(nextPros.listRes.strategyResultFilters),
                isShowSel: this.dateScoreReverse(nextPros.listRes.strategyResultFilters),
            });
        }
    }

    // 市 更改
    handleCityChange = (value) => {
        this.setState({ cityCode: value })
    }

    // 查询地市
    handleProvinceChange = (provinceCode, cityCode) => {
        console.log(cityCode, 'cityCode-----')
        // 设置地市的code,并且当切换时，将地市code置为空
        // const { setFieldsValue } = this.props.form;
        // let proviceNumber;
        // setFieldsValue({
        //   'value1': '',
        // });
        // 根据省联动查询地市
        fetchCityListByProvinceCode({
            provinceCode: provinceCode
        }).then((result) => {
            this.setState({
                cityListOptions: result.data.cityList.map(item => {
                    return {
                        text: item.cityName,
                        value: item.cityCode
                    }
                })
            });
        }).catch((data) => {
        })
    }

    // 结果集自己级 删除一个
    removeS = (k) => {
        const { form, title } = this.props;
        const keys = form.getFieldValue('__keys__');
        if (keys.length === 1) {
            return;
        }
        if (title === '编辑分案策略') {
            // delete this.state.typeSelObj[k];
            // this.setState({
            //     typeSelObj: {
            //         ...this.state.typeSelObj
            //     }
            // })
        }
        form.setFieldsValue({
            __keys__: keys.filter(key => key !== k),
        });
    }

    // 结果集自己级 增加一个
    add = () => {
        const { form, title,  } = this.props;
        const keys = form.getFieldValue('__keys__');
        const nextKeys = keys.concat(uuid++);
        if (title === '编辑分案策略') {
            const newKeys = keys.concat(keys.length++);
            form.setFieldsValue({
                __keys__: newKeys.filter(item => item),
            });
            return;
        }
        form.setFieldsValue({
            __keys__: nextKeys,
        });
    }

    // 结果集修改第二个下拉框 值改变
    fetchCompareVal = (option, k) => {
        // console.log(option, k, '----------')
        if (option === 'between') {
            this.setState({
                isShowSel: {
                    ...this.state.isShowSel,
                    [k]: { flag: '4' }
                }
            });
        } else {
            this.setState({
                isShowSel: {
                    ...this.state.isShowSel,
                    [k]: { flag: '5' }
                }
            });
        }
        this.setState({
            currDecied: {
                ...this.state.currDecied,
                [k]: { flag: false, tag: option }
            },
        });
    }

    // 根据第一个下拉选择第三个下拉值
    fetchSelList(value, k) {
        const { options } = this.props;
        let entrustStatusListArr = [];
        options.entrustStatusListString && options.entrustStatusListString.forEach(item => {
            entrustStatusListArr.push({
                status: item.value,
                desc: item.text
            });
        });
        switch (value) {
            case 'product_code':
                optionsApi.fetchProductList().then(res => {
                    if (res.data) {
                        this.setState({
                            typeSelObj: {
                                ...this.state.typeSelObj,
                                [k]: res.data
                            }
                        });
                    }
                });
                break;
            case 'tag':
                optionsApi.fetchTagList().then(res => {
                    if (res.data) {
                        this.setState({
                            typeSelObj: {
                                ...this.state.typeSelObj,
                                [k]: res.data
                            }
                        });
                    }
                });
                break;
            case 'merchant':
                optionsApi.fetchMerchantList().then(res => {
                    if (res.data) {
                        this.setState({
                            typeSelObj: {
                                ...this.state.typeSelObj,
                                [k]: res.data
                            }
                        });
                    }
                });
                break;
            case 'entruStatus':
                this.setState({
                    typeSelObj: {
                        ...this.state.typeSelObj,
                        [k]: entrustStatusListArr
                    }
                });
                break;
            case 'cancel':
                this.setState({
                    typeSelObj: {
                        ...this.state.typeSelObj,
                        [k]: cancelList
                    }
                });
                break;
        }
    }

    // 选择当前规则集单项
    selRuleItem(value, k) {
        this.setState({ selAllList: [] });
        // 规则里面下拉列表值
        this.fetchSelList(value, k);
        switch (value) {
            case 'overdue_days':
            case 'score':
                this.setState({
                    currDecied: {
                        ...this.state.currDecied,
                        [k]: { flag: false, tag: 'between' }
                    },
                    isShowSel: {
                        ...this.state.isShowSel,
                        [k]: { flag: '4' }
                    }
                });
                break;
            case 'area':
                this.setState({
                    currDecied: {
                        ...this.state.currDecied,
                        [k]: { flag: true, tag: '=' }
                    },
                    isShowSel: {
                        ...this.state.isShowSel,
                        [k]: { flag: '2' }
                    }
                });
                break;
            default:
                this.setState({
                    currDecied: {
                        ...this.state.currDecied,
                        [k]: { flag: true, tag: '=' }
                    },
                    isShowSel: {
                        ...this.state.isShowSel,
                        [k]: { flag: '3' }
                    }
                });
                break;
        }
    }

    // 数据转化方法
    dateFlagReverse(data) {
        if (!Array.isArray(data)) return [];
        for (let i = 0, len = data.length; i < len; i++) {
            let item = data[i];
            let currFlag;
            if (item.left === 'overdue_days' || item.left === 'score') {
                currFlag = false;
            } else {
                currFlag = true;
            }
            newFlag[i] = {
                flag: currFlag,
                tag: item.flag
            };
        }
        return newFlag;
    }
    dateScoreReverse(data) {
        if (!Array.isArray(data)) return [];
        for (let i = 0, len = data.length; i < len; i++) {
            let item = data[i];
            let currtNum = '';
            if ((item.left === 'overdue_days' || item.left === 'score') && (item.flag === 'between')) {
                currtNum = '4';
            } else if ((item.left === 'overdue_days' || item.left === 'score') && (item.flag !== 'between')) {
                currtNum = '5';
            } else if (item.left === 'area') {
                currtNum = '2';
            } else if ((item.left !== 'overdue_days' || item.left !== 'score' || item.left !== 'area')) {
                currtNum = '3';
            }
            newIsShow[i] = {
                flag: currtNum
            };
        }
        return newIsShow;
    }
    transferData(data) {
        if (data && data.length) {
            let newArr = [];
            for (let i = 0; i < data.length; i++) {
                let item = data[i];
                newArr.push({
                    idx: Math.random() + i,
                    left: item.left,
                    flag: item.flag,
                    value1: item.value1,
                    value2: item.value2
                });
            }
            newArr && newArr.map(item => {
                newData[item.idx] = item;
            })
        }
        return newData;
    }

    render() {
        const formItemLayout = {
            labelCol: { span: 10 },
            wrapperCol: { span: 12 },
        };
        const { options, form, state, defaultFieldsValue, actions, title, proviceListData, listRes, detailStatus } = this.props;
        const { isVisibleAlloctBox, isAlloctRuleVisible, isVisibleAlloct,
            selAllList, cityListOptions, newSelList, typeSelObj, currDecied, isShowSel } = this.state;
        const { getFieldDecorator, getFieldValue } = form;

        // 结果集自己级 增加一个key
        getFieldDecorator('__keys__', { initialValue: (title === '编辑分案策略' || title === '查看详情') ? listRes && listRes.strategyResultFilters : [0] });
        const __keys__ = getFieldValue('__keys__');

        // console.log(currDecied, 'currDecied', isShowSel, 'isShowSel------', __keys__)
        console.log(typeSelObj, 'typeSelObj-----')
        // 规则集分配
        const alloctRuleFroms = __keys__.map((k, index) => {
            // console.log('currDecied', currDecied, 'isShowSel', isShowSel, '--kkkk--', isShowSel[index], currDecied[index])
            return (
                <div key={k}>
                    {(title === '编辑分案策略' || title === '查看详情') ?
                        <div className={styles.bot}>
                            <div style={{ float: 'left', marginRight: 20 }}>
                                <Form.Item
                                    label=''
                                >
                                    {
                                        getFieldDecorator(`left[${index}]`, {
                                            rules: [
                                                { required: true, message: '请选择' }
                                            ],
                                            initialValue: k.left
                                        })(
                                            <Select disabled={detailStatus ? true : false} placeholder='请选择' style={{ width: 160 }}
                                                onChange={(value) => this.selRuleItem(value, index)}>
                                                {conditionData.map(item => <Option key={item.value} value={item.value}>{item.name}</Option>)}
                                            </Select>
                                        )
                                    }
                                </Form.Item>
                            </div>
                            <div style={{ float: 'left', marginRight: 20 }}>
                                <Form.Item>
                                    {
                                        getFieldDecorator(`flag[${index}]`, {
                                            rules: [
                                                { required: true, message: '请选择' }
                                            ],
                                            initialValue: k.flag || (currDecied[k] && currDecied[k].flag ? '=' : 'between')
                                        })(
                                            <Select placeholder='请选择'
                                                disabled={currDecied[index] && currDecied[index].flag}
                                                onChange={(value) => this.fetchCompareVal(value, index)} style={{ padding: 0, width: 160 }}>
                                                <Option value="between" key="between">between</Option>
                                                <Option value="!=" key="noEqual">=!</Option>
                                                <Option value="=" key="equal">=</Option>
                                                <Option value=">" key="greaterThan">&gt;</Option>
                                                <Option value="<" key="lessThan">&lt;</Option>
                                                <Option value=">=" key="greaterThanEqual">&gt;=</Option>
                                                <Option value="<=" key="lessThanEqual">&lt;=</Option>
                                            </Select>
                                        )
                                    }
                                </Form.Item>
                            </div>
                            <div style={{ float: 'left', marginRight: 20 }}>
                                {(isShowSel[index] && isShowSel[index].flag == '3') && <div>
                                    <FormItem
                                        label=""
                                    >
                                        {
                                            getFieldDecorator(`value1[${index}]`, {
                                                rules: [
                                                    { required: true, message: '请选择条件' }
                                                ],
                                                initialValue: k.value1 && k.value1.split(',')
                                            })(
                                                <Select disabled={detailStatus ? true : false} placeholder="请选择" mode="multiple" style={{ padding: 0, width: 160 }}>
                                                    {(typeSelObj[index] && typeSelObj[index] || []).map(item => <Option key={item.status} value={item.status}>{item.desc}</Option>)}
                                                </Select>
                                            )
                                        }
                                    </FormItem>
                                    <FormItem
                                        style={{ padding: 0, display: 'none' }}
                                        label=""
                                    >
                                        {
                                            getFieldDecorator(`value2[${index}]`, {
                                                rules: [
                                                    { required: false, message: '请选择条件' }
                                                ],
                                                initialValue: '0'
                                            })(
                                                (<Input disabled={detailStatus ? true : false} placeholder="请输入" style={{ width: 100, height: 28, verticalAlign: 1 }} />)
                                            )
                                        }
                                    </FormItem>
                                </div>}
                                {(isShowSel[index] && isShowSel[index].flag == '2') && <div>
                                    <FormItem
                                        label=""
                                        style={{ float: 'left' }}
                                    >
                                        {
                                            getFieldDecorator(`value2[${index}]`, {
                                                rules: [
                                                    { required: true, message: '请选择省份' }
                                                ],
                                                initialValue: k.value2
                                            })(
                                                <Select disabled={detailStatus ? true : false} placeholder="请选择" style={{ padding: 0, width: 160 }} onChange={(value) => this.handleProvinceChange(value, k)}>
                                                    {proviceListData && proviceListData.map(item => <Option key={item.value} value={item.value}>{item.text}</Option>)}
                                                </Select>
                                            )
                                        }
                                    </FormItem>
                                    <FormItem
                                        label=""
                                        style={{ float: 'left', marginLeft: 20 }}
                                    >
                                        {
                                            getFieldDecorator(`value1[${index}]`, {
                                                rules: [
                                                    { required: true, message: '请选择城市' }
                                                ],
                                                initialValue: k.value1
                                            })(
                                                <Select disabled={detailStatus ? true : false} placeholder="请选择" style={{ padding: 0, width: 160 }} onChange={this.handleCityChange}>
                                                    {cityListOptions && cityListOptions.map(item => <Option key={item.value} value={item.value}>{item.text}</Option>)}
                                                </Select>
                                            )
                                        }
                                    </FormItem>
                                </div>}
                                {(isShowSel[index] && isShowSel[index].flag == '5') && (currDecied[index] && currDecied[index].tag != 'between') && <div>
                                    <FormItem
                                        label=""
                                    >
                                        {
                                            getFieldDecorator(`value1[${index}]`, {
                                                rules: [
                                                    { required: true, message: '请选择条件' }
                                                ],
                                                initialValue: k.value1
                                            })(
                                                (<Input disabled={detailStatus ? true : false} placeholder="请输入" style={{ width: 70, height: 28, verticalAlign: 1 }} />)
                                            )
                                        }
                                    </FormItem>
                                    <FormItem
                                        style={{ padding: 0, display: 'none' }}
                                        label=""
                                    >
                                        {
                                            getFieldDecorator(`value2[${index}]`, {
                                                rules: [
                                                    { required: false, message: '请选择条件' }
                                                ],
                                                initialValue: '0'
                                            })(
                                                (<Input disabled={detailStatus ? true : false} placeholder="请输入" style={{ width: 100, height: 28, verticalAlign: 1 }} />)
                                            )
                                        }
                                    </FormItem>
                                </div>}
                                {(isShowSel[index] && isShowSel[index].flag == '4') && (currDecied[index] && currDecied[index].tag == 'between') && <div>
                                    <FormItem
                                        label=""
                                        style={{ float: 'left' }}
                                    >
                                        {
                                            getFieldDecorator(`value1[${index}]`, {
                                                rules: [
                                                    { required: true, message: '请选择条件' }
                                                ],
                                                initialValue: k.value1
                                            })(
                                                (<Input disabled={detailStatus ? true : false} placeholder="请输入" style={{ width: 70, height: 28, verticalAlign: 1 }} />)
                                            )
                                        }
                                    </FormItem>
                                    <FormItem
                                        label=""
                                        style={{ marginLeft: 20, float: 'left' }}
                                    >
                                        {
                                            getFieldDecorator(`value2[${index}]`, {
                                                rules: [
                                                    { required: true, message: '请选择条件' },
                                                    {
                                                        validator: (rule, value, callback, source) => {
                                                            const { getFieldValue } = this.props.form;
                                                            let value1 = getFieldValue(`value1[${index}]`);
                                                            if (Number(value1) < value) {
                                                                callback()
                                                            } else {
                                                                callback('开始逾期天数不能大于末尾逾期天数！')
                                                            }
                                                        }
                                                    }
                                                ],
                                                validateFirst: true,
                                                validateTrigger: 'onBlur',
                                                initialValue: k.value2 || ''
                                            })(
                                                (<Input disabled={detailStatus ? true : false} placeholder="请输入" style={{ width: 70, height: 28, verticalAlign: 1 }} />)
                                            )
                                        }
                                    </FormItem>
                                </div>}
                            </div>
                            {(__keys__.length > 1) && <div style={{ float: 'left', display: (detailStatus ? 'none' : 'block') }}>
                                <Icon
                                    className="dynamic-delete-button"
                                    type="minus-circle-o"
                                    style={{ color: '#1890ff', marginTop: 12 }}
                                    onClick={() => this.removeS(index)}
                                />
                            </div>}
                        </div>
                        :
                        <div className={styles.bot} >
                            <div style={{ float: 'left', marginRight: 20 }}>
                                <Form.Item
                                    label=''
                                >
                                    {
                                        getFieldDecorator(`left[${k}]`, {
                                            rules: [
                                                { required: true, message: '请选择' }
                                            ],
                                            initialValue: ''
                                        })(
                                            <Select disabled={detailStatus ? true : false} placeholder='请选择' style={{ width: 160 }}
                                                onChange={(value) => this.selRuleItem(value, k)}>
                                                {conditionData.map(item => <Option key={item.value} value={item.value}>{item.name}</Option>)}
                                            </Select>
                                        )
                                    }
                                </Form.Item>
                            </div>
                            <div style={{ float: 'left', marginRight: 20 }}>
                                <Form.Item>
                                    {
                                        getFieldDecorator(`flag[${index}]`, {
                                            rules: [
                                                { required: true, message: '请选择' }
                                            ],
                                            initialValue: (currDecied[k] && currDecied[k].flag ? '=' : 'between')
                                        })(
                                            <Select placeholder='请选择'
                                                disabled={currDecied[k] && currDecied[k].flag}
                                                onChange={(value) => this.fetchCompareVal(value, k)} style={{ padding: 0, width: 160 }}>
                                                <Option value="between" key="between">between</Option>
                                                <Option value="!=" key="noEqual">=!</Option>
                                                <Option value="=" key="equal">=</Option>
                                                <Option value=">" key="greaterThan">&gt;</Option>
                                                <Option value="<" key="lessThan">&lt;</Option>
                                                <Option value=">=" key="greaterThanEqual">&gt;=</Option>
                                                <Option value="<=" key="lessThanEqual">&lt;=</Option>
                                            </Select>
                                        )
                                    }
                                </Form.Item>
                            </div>
                            <div style={{ float: 'left', marginRight: 20 }}>
                                {(isShowSel[k] && isShowSel[k].flag == '3') && <div>
                                    <FormItem
                                        label=""
                                    >
                                        {
                                            getFieldDecorator(`value1[${index}]`, {
                                                rules: [
                                                    { required: true, message: '请选择条件' }
                                                ],
                                                initialValue: []
                                            })(
                                                <Select disabled={detailStatus ? true : false} placeholder="请选择" mode="multiple" style={{ padding: 0, width: 160 }}>
                                                    {(typeSelObj[k] && typeSelObj[k] || []).map(item => <Option key={item.status} value={item.status}>{item.desc}</Option>)}
                                                </Select>
                                            )
                                        }
                                    </FormItem>
                                    <FormItem
                                        style={{ padding: 0, display: 'none' }}
                                        label=""
                                    >
                                        {
                                            getFieldDecorator(`value2[${index}]`, {
                                                rules: [
                                                    { required: false, message: '请选择条件' }
                                                ],
                                                initialValue: '0'
                                            })(
                                                (<Input disabled={detailStatus ? true : false} placeholder="请输入" style={{ width: 100, height: 28, verticalAlign: 1 }} />)
                                            )
                                        }
                                    </FormItem>
                                </div>}
                                {(isShowSel[k] && isShowSel[k].flag == '2') && <div>
                                    <FormItem
                                        label=""
                                        style={{ float: 'left' }}
                                    >
                                        {
                                            getFieldDecorator(`value2[${index}]`, {
                                                rules: [
                                                    { required: true, message: '请选择省份' }
                                                ],
                                                initialValue: ''
                                            })(
                                                <Select disabled={detailStatus ? true : false} placeholder="请选择" style={{ padding: 0, width: 160 }} onChange={(value) => this.handleProvinceChange(value, k)}>
                                                    {proviceListData && proviceListData.map(item => <Option key={item.value} value={item.value}>{item.text}</Option>)}
                                                </Select>
                                            )
                                        }
                                    </FormItem>
                                    <FormItem
                                        label=""
                                        style={{ float: 'left', marginLeft: 20 }}
                                    >
                                        {
                                            getFieldDecorator(`value1[${index}]`, {
                                                rules: [
                                                    { required: true, message: '请选择城市' }
                                                ],
                                                initialValue: ''
                                            })(
                                                <Select disabled={detailStatus ? true : false} placeholder="请选择" style={{ padding: 0, width: 160 }} onChange={this.handleCityChange}>
                                                    {cityListOptions && cityListOptions.map(item => <Option value={item.value}>{item.text}</Option>)}
                                                </Select>
                                            )
                                        }
                                    </FormItem>
                                </div>}
                                {(isShowSel[k] && isShowSel[k].flag == '5') && (currDecied[k] && currDecied[k].tag != 'between') && <div>
                                    <FormItem
                                        label=""
                                    >
                                        {
                                            getFieldDecorator(`value1[${index}]`, {
                                                rules: [
                                                    { required: true, message: '请选择条件' }
                                                ],
                                                initialValue: ''
                                            })(
                                                (<Input disabled={detailStatus ? true : false} placeholder="请输入" style={{ width: 70, height: 28, verticalAlign: 1 }} />)
                                            )
                                        }
                                    </FormItem>
                                    <FormItem
                                        style={{ padding: 0, display: 'none' }}
                                        label=""
                                    >
                                        {
                                            getFieldDecorator(`value2[${index}]`, {
                                                rules: [
                                                    { required: false, message: '请选择条件' }
                                                ],
                                                initialValue: '0'
                                            })(
                                                (<Input disabled={detailStatus ? true : false} placeholder="请输入" style={{ width: 100, height: 28, verticalAlign: 1 }} />)
                                            )
                                        }
                                    </FormItem>
                                </div>}
                                {(isShowSel[k] && isShowSel[k].flag == '4') && (currDecied[k] && currDecied[k].tag == 'between') && <div>
                                    <FormItem
                                        label=""
                                        style={{ float: 'left' }}
                                    >
                                        {
                                            getFieldDecorator(`value1[${index}]`, {
                                                rules: [
                                                    { required: true, message: '请选择条件' }
                                                ],
                                                initialValue: ''
                                            })(
                                                (<Input disabled={detailStatus ? true : false} placeholder="请输入" style={{ width: 70, height: 28, verticalAlign: 1 }} />)
                                            )
                                        }
                                    </FormItem>
                                    <FormItem
                                        label=""
                                        style={{ marginLeft: 20, float: 'left' }}
                                    >
                                        {
                                            getFieldDecorator(`value2[${index}]`, {
                                                rules: [
                                                    { required: true, message: '请选择条件' },
                                                    {
                                                        validator: (rule, value, callback, source) => {
                                                            const { getFieldValue } = this.props.form;
                                                            let value1 = getFieldValue(`value1[${index}]`);
                                                            if (Number(value1) < value) {
                                                                callback()
                                                            } else {
                                                                callback('开始逾期天数不能大于末尾逾期天数！')
                                                            }
                                                        }
                                                    }
                                                ],
                                                validateFirst: true,
                                                validateTrigger: 'onBlur',
                                                initialValue: ''
                                            })(
                                                (<Input disabled={detailStatus ? true : false} placeholder="请输入" style={{ width: 70, height: 28, verticalAlign: 1 }} />)
                                            )
                                        }
                                    </FormItem>
                                </div>}
                            </div>
                            {(__keys__.length > 1) && <div style={{ float: 'left', display: (detailStatus ? 'none' : 'block') }}>
                                <Icon
                                    className="dynamic-delete-button"
                                    type="minus-circle-o"
                                    style={{ color: '#1890ff', marginTop: 12 }}
                                    onClick={() => this.removeS(k)}
                                />
                            </div>}
                        </div>}
                </div>
            )
        });

        return (
            <Fragment>
                <div className={styles.cells}>
                    <h1>结果集条件配置</h1>
                    <div className={styles.decisionCondition}>
                        <div className={styles.treeRule}>
                            {detailStatus ? null :
                                <div className={styles.top}>
                                    <Row gutter={16}>
                                        <Col span={4} style={{ display: 'inline-block', float: 'left', paddingLeft: 30 }}>如下列条件：</Col>
                                        <Col span={7} style={{ float: 'right', padding: 0, textAlign: 'right', marginRight: 70 }}>
                                            <Button onClick={this.add} type="primary" icon="plus-circle-o" style={{ marginRight: '10px' }}>添加一个</Button>
                                        </Col>
                                    </Row>
                                </div>}
                            {alloctRuleFroms}
                        </div>
                    </div>
                </div>
            </Fragment>
        )
    }
}

export default ChildRules;

