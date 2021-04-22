import React, { useEffect, useState } from 'react';
import './App.css';
import {
  Routing,
  IRouterOptions,
  PanelBody,
  PanelHeader,
  useRouter,
  usePanelContext,
  IRouter,
  IPopExtrasProps,
} from 'react-wv-navigation';

const ROUTERS: IRouterOptions[] = [
  {},
  {
    key: 'modal',
    zIndex: 10,
  },
];

function App() {
  return (
    <Routing routers={ROUTERS}>
      <Main />
    </Routing>
  );
}

const Main: React.FC = () => {
  const { pushScreen } = useRouter();

  useEffect(() => {
    pushScreen({ key: '1', screen: <LongTextScreen /> });
  }, [pushScreen]);

  return null;
};

export default App;

const LongTextScreen: React.FC = () => {
  const { pushScreen, popScreen } = useRouter();

  return (
    <>
      <PanelHeader onBack={popScreen}></PanelHeader>
      <PanelBody>
        <button
          onClick={() => {
            const key = count++ + '';
            pushScreen({ key: key, screen: <TestScreen screnKey={key} /> });
          }}
        >
          Complext Screen
        </button>
        {new Array(1)
          .fill(
            `Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita vitae,
        voluptatibus beatae fuga dolorum sapiente, nam quae amet aliquam
        necessitatibus ipsa consequatur illo animi ratione, suscipit impedit
        exercitationem quos dolore.`
          )
          .map(t => (
            <p>{t}</p>
          ))}
        <button
          onClick={() => pushScreen({ key: '2', screen: <LongTextScreen /> })}
        >
          Next
        </button>
      </PanelBody>
    </>
  );
};

const Interactive: React.FC = () => {
  const { pushScreen, popScreen } = useRouter();

  return (
    <>
      <PanelHeader onBack={popScreen}></PanelHeader>
      <PanelBody>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita vitae,
        voluptatibus beatae fuga dolorum sapiente, nam quae amet aliquam
        necessitatibus ipsa consequatur illo animi ratione, suscipit impedit
        exercitationem quos dolore.
        <button
          onClick={() => pushScreen({ key: '2', screen: <LongTextScreen /> })}
        >
          Next
        </button>
      </PanelBody>
    </>
  );
};

let count = 0;
type PopExtra = { someExtra: string };
const TestScreen: React.FC<{
  screnKey: string;
  withGuard?: boolean;
  // router: IRouter;
} & IPopExtrasProps<PopExtra>> = props => {
  const { pushScreen, popScreen, markToClearHistoryUntil } = useRouter();
  const secondRouter = useRouter('modal');
  const [textState, setTextState] = useState('');
  const [backToKey, setBackToKey] = useState('');
  const [backToIncluding, setBackToIncluding] = useState(false);
  const [popExtra, setPropExtra] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [clearHistoryScreenKey, setClearHistoryScreenKey] = useState('');
  const [including, setIncluding] = useState(false);
  const [isBackEnabled, setIsBackEnabled] = useState(true);
  const { cancelSwipe } = usePanelContext();

  // usePanelStateEvents({
  //   onBecomeActive: () => {
  //     setIsActive(true);
  //   },
  // });

  const handleBack = () => {
    if (props.withGuard) {
      const ok = window.confirm('Go Back?');
      if (ok) {
        popScreen();
      } else {
        cancelSwipe();
      }
    } else {
      popScreen();
    }
  };

  return (
    <PanelBody>
      <PanelHeader
        onBack={isBackEnabled ? handleBack : undefined}
      ></PanelHeader>
      {props.children}
      Screen key is {props.screnKey}. is Active {isActive}
      <button
        onClick={() => {
          const newKey = count++;
          pushScreen({
            screen: <TestScreen screnKey={newKey.toString()} />,
            key: newKey.toString(),
          });
        }}
      >
        Next
      </button>
      <button
        onClick={() => {
          const newKey = count++;
          pushScreen({
            screen: <TestScreen withGuard screnKey={newKey.toString()} />,
            key: newKey.toString(),
          });
        }}
      >
        Next With Guard
      </button>
      <button
        onClick={() => {
          const newKey = count++;
          secondRouter.pushScreen({
            screen: <TestScreen screnKey={newKey.toString()} />,
            key: newKey.toString(),
          });
        }}
      >
        Next In Second router
      </button>
      <hr />
      <label>Clear history until Key</label>
      <input
        value={clearHistoryScreenKey}
        onChange={e => setClearHistoryScreenKey(e.target.value)}
      />
      <label>Including</label>
      <input
        type="checkbox"
        checked={including}
        onChange={() => setIncluding(s => !s)}
      />
      <button
        onClick={() => {
          const newKey = (count++).toString();
          if (clearHistoryScreenKey) {
            markToClearHistoryUntil({
              untilKey: clearHistoryScreenKey,
              including: including,
            });
          }

          pushScreen({
            screen: <TestScreen screnKey={newKey} />,
            key: newKey,
          });
        }}
      >
        Push and clear history
      </button>
      <hr />
      <label>Some random state</label>
      <input value={textState} onChange={e => setTextState(e.target.value)} />
      <label>Pop Extras</label>
      <p>{props.popExtras?.someExtra}</p>
      <hr />
      <label>Pop to Key</label>
      <input value={backToKey} onChange={e => setBackToKey(e.target.value)} />
      <label>Pop to including</label>
      <input
        type="checkbox"
        checked={backToIncluding}
        onChange={() => setBackToIncluding(s => !s)}
      />
      <button
        onClick={() => {
          popScreen({ toScreen: backToKey, including: backToIncluding });
        }}
      >
        Pop
      </button>
      <label>Pop To screen state</label>
      <input value={popExtra} onChange={e => setPropExtra(e.target.value)} />
      <button
        onClick={() => {
          popScreen<PopExtra>({
            toScreen: backToKey,
            popExtras: {
              someExtra: popExtra,
            },
          });
        }}
      >
        Pop
      </button>
      <div
        style={{ height: 20, width: 20, background: 'red', zIndex: 100 }}
      ></div>
      <label>Enable going back</label>
      <input
        type="checkbox"
        checked={isBackEnabled}
        onChange={() => setIsBackEnabled(s => !s)}
      />
    </PanelBody>
  );
};
