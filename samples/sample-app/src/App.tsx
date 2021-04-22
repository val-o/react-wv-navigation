import React, { useEffect } from 'react';
import './App.css';
import {
  Routing,
  IRouterOptions,
  PanelBody,
  PanelHeader,
  useRouter,
} from 'react-wv-navigation';
import { Button } from '@material-ui/core';

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
      <PanelHeader leftAction='back' onLeftAction={popScreen}></PanelHeader>
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
