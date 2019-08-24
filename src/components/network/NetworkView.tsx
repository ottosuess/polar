import React from 'react';
import { RouteComponentProps } from 'react-router';
import { useStoreState } from 'store';
import { PageHeader, Row, Col, Divider } from 'antd';
import styles from './NetworkView.module.less';
import { StatusTag } from 'components/common';
import NetworkActions from './NetworkActions';
import LndCard from './LndCard';
import BitcoindCard from './BitcoindCard';

interface MatchParams {
  id?: string;
}

const NetworkView: React.FC<RouteComponentProps<MatchParams>> = ({ match }) => {
  const network = useStoreState(s => s.network.networkById(match.params.id));
  if (!network) {
    return null;
  }

  const { lightning, bitcoin } = network.nodes;

  return (
    <>
      <PageHeader
        title={network.name}
        subTitle="1 bitcoind, 2 LND"
        onBack={() => {}}
        className={styles.header}
        tags={<StatusTag status={network.status} />}
        extra={<NetworkActions status={network.status} />}
      />
      <Divider>Lightning Nodes</Divider>
      <Row gutter={16}>
        {lightning.map(node => (
          <Col key={node.id} span={8}>
            <LndCard node={node} />
          </Col>
        ))}
      </Row>
      <Divider>Bitcoin Nodes</Divider>
      <Row gutter={16}>
        {bitcoin.map(node => (
          <Col key={node.id} span={8}>
            <BitcoindCard node={node} />
          </Col>
        ))}
      </Row>
    </>
  );
};

export default NetworkView;