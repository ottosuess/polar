import React, { ReactNode, useEffect, useState } from 'react';
import { useAsyncCallback } from 'react-async-hook';
import { RouteComponentProps } from 'react-router';
import { info } from 'electron-log';
import styled from '@emotion/styled';
import { Alert, Button, Empty, Input, Modal, PageHeader } from 'antd';
import { usePrefixedTranslation } from 'hooks';
import { Status } from 'shared/types';
import { useStoreActions, useStoreState } from 'store';
import { getMissingImages } from 'utils/network';
import { StatusTag } from 'components/common';
import NetworkDesigner from 'components/designer/NetworkDesigner';
import { HOME } from 'components/routing';
import NetworkActions from './NetworkActions';

const Styled = {
  Empty: styled(Empty)`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  `,
  NetworkView: styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
  `,
  PageHeader: styled(PageHeader)`
    border: 1px solid rgb(235, 237, 240);
    background-color: #fff;
    margin-bottom: 10px;
    flex: 0;
  `,
  RenameInput: styled(Input)`
    width: 500px;
  `,
  Alert: styled(Alert)`
    margin-bottom: 10px;
  `,
  NetworkDesigner: styled(NetworkDesigner)`
    flex: 1;
  `,
  Error: styled.pre`
    font-size: 11px;
  `,
};

interface MatchParams {
  id?: string;
}

const NetworkView: React.FC<RouteComponentProps<MatchParams>> = ({ match }) => {
  useEffect(() => info('Rendering NetworkView component'), []);
  const { l } = usePrefixedTranslation('cmps.network.NetworkView');

  const { networks } = useStoreState(s => s.network);
  const networkId = parseInt(match.params.id || '');
  const network = networks.find(n => n.id === networkId);

  const [editing, setEditing] = useState(false);
  const [editingName, setEditingName] = useState('');

  const { navigateTo, notify } = useStoreActions(s => s.app);
  const { dockerImages } = useStoreState(s => s.app);
  const { toggle, rename, remove } = useStoreActions(s => s.network);
  const toggleAsync = useAsyncCallback(toggle);
  const renameAsync = useAsyncCallback(async (payload: { id: number; name: string }) => {
    try {
      await rename(payload);
      setEditing(false);
    } catch (error) {
      notify({ message: l('renameError'), error });
    }
  });

  const showRemoveModal = (networkId: number, name: string) => {
    Modal.confirm({
      title: l('deleteTitle'),
      content: l('deleteContent'),
      okText: l('deleteConfirmBtn'),
      okType: 'danger',
      cancelText: l('deleteCancelBtn'),
      onOk: async () => {
        try {
          await remove(networkId);
          notify({ message: l('deleteSuccess', { name }) });
          // no need to navigate away since it will be done by useEffect below
        } catch (error) {
          notify({ message: l('deleteError'), error });
          throw error;
        }
      },
    });
  };

  useEffect(() => {
    if (!network) navigateTo(HOME);
  }, [network, navigateTo]);

  if (!network) return null;

  let header: ReactNode;
  if (editing) {
    header = (
      <Styled.PageHeader
        title={
          <Styled.RenameInput
            name="newNetworkName"
            value={editingName}
            onChange={e => setEditingName(e.target.value)}
          />
        }
        extra={[
          <Button
            key="save"
            type="primary"
            loading={renameAsync.loading}
            onClick={() => renameAsync.execute({ id: network.id, name: editingName })}
          >
            {l('renameSave')}
          </Button>,
          <Button key="cancel" type="link" onClick={() => setEditing(false)}>
            {l('renameCancel')}
          </Button>,
        ]}
      ></Styled.PageHeader>
    );
  } else {
    header = (
      <Styled.PageHeader
        title={network.name}
        onBack={() => navigateTo(HOME)}
        tags={<StatusTag status={network.status} />}
        extra={
          <NetworkActions
            network={network}
            onClick={() => toggleAsync.execute(network.id)}
            onRenameClick={() => {
              setEditing(true);
              setEditingName(network.name);
            }}
            onDeleteClick={() => showRemoveModal(network.id, network.name)}
          />
        }
      />
    );
  }

  const missingImages = getMissingImages(network, dockerImages);
  const showNotice =
    [Status.Stopped, Status.Starting].includes(network.status) &&
    missingImages.length > 0;

  return (
    <Styled.NetworkView>
      {header}
      {showNotice && <Styled.Alert type="info" message={l('missingImages')} showIcon />}
      {toggleAsync.error && (
        <Styled.Alert
          type="error"
          message={<Styled.Error>{toggleAsync.error.message}</Styled.Error>}
        />
      )}
      <Styled.NetworkDesigner network={network} />
    </Styled.NetworkView>
  );
};

export default NetworkView;
