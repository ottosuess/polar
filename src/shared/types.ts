export enum Status {
  Starting,
  Started,
  Stopping,
  Stopped,
  Error,
}

export interface CommonNode {
  // TODO: change id to a uuid
  id: number;
  networkId: number;
  name: string;
  type: 'bitcoin' | 'lightning';
  version: string;
  status: Status;
  errorMsg?: string;
}

export interface LightningNode extends CommonNode {
  type: 'lightning';
  implementation: 'LND' | 'c-lightning' | 'eclair';
  backendName: string;
}

export enum LndVersion {
  latest = '0.8.0-beta',
  '0.8.0-beta' = '0.8.0-beta',
  '0.7.1-beta' = '0.7.1-beta',
}

export interface LndNode extends LightningNode {
  paths: {
    tlsCert: string;
    adminMacaroon: string;
    readonlyMacaroon: string;
  };
  ports: {
    rest: number;
    grpc: number;
  };
}

export interface BitcoinNode extends CommonNode {
  type: 'bitcoin';
  implementation: 'bitcoind' | 'btcd';
  ports: {
    rpc: number;
  };
}
