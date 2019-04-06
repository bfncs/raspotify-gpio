declare module "mopidy" {
  import EventEmitter = NodeJS.EventEmitter;

  interface Playback {
    play: (params: { tlid: number /* number >0 */ }) => Promise<void>;
  }

  interface Tracklist {
    add: (params: {
      at_position: number;
      tracks?: string;
      uri?: string;
      uris?: string;
    }) => Promise<void>;
    clear: () => Promise<void>;
    setRandom: (params: { value: boolean }) => Promise<void>;
  }

  export default class Mopidy extends EventEmitter {
    constructor(opts: {
      autoConnect?: boolean;
      backoffDelayMin?: number;
      backoffDelayMax?: number;
      console?: any;
      webSocketUrl?: string;
    });
    public playback: Playback;
    public tracklist: Tracklist;
  }
}
