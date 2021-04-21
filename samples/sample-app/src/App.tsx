import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import {
  Routing,
  IRouterOptions,
  PanelBody,
  PanelHeader,
  useRouter,
} from 'react-wv-navigation';

const ROUTERS: IRouterOptions[] = [
  {},
  {
    key: 'modal',
    zIndex: 10,
  },
];

function App() {
  const { pushScreen } = useRouter();

  useEffect(() => {
    pushScreen({ key: '1', screen: <LongTextScreen /> });
  }, [pushScreen]);

  return <Routing routers={ROUTERS}></Routing>;
}

export default App;

const LongTextScreen: React.FC = () => {
  return (
    <>
      <PanelHeader></PanelHeader>
      <PanelBody>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita vitae,
        voluptatibus beatae fuga dolorum sapiente, nam quae amet aliquam
        necessitatibus ipsa consequatur illo animi ratione, suscipit impedit
        exercitationem quos dolore.
      </PanelBody>
    </>
  );
};
