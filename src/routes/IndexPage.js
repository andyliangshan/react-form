import React from 'react';
import { connect } from 'dva';
import { Tabs  } from 'antd';
import EgPage1 from '../components/eg1/eg1.js'
import EgPage2 from '../components/eg2/eg2.js'
import styles from './IndexPage.css';

const TabPane = Tabs.TabPane;

function IndexPage(props) {
  return (
    <div className={styles.normal}>
      <Tabs defaultActiveKey="1" >
       <TabPane tab="没数据" key="1">
         <EgPage1 />
       </TabPane>
       <TabPane tab="有数据" key="2">
         <EgPage2 />
       </TabPane>
    </Tabs>
    </div>
  );
}

export default connect()(IndexPage);
