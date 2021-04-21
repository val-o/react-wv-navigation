// import { AppDecorator, storyAsComponent } from 'infrastructure/storybook';
// import React, { useEffect, useState } from 'react';
// import { PanelBody } from 'modules/common/ui/panel/PanelBody';
// import { PanelHeader } from 'modules/common/ui/panel/PanelHeader';
// import { useRouter } from '.';
// import { usePanelContext } from '../ui/panel';
// import { Routing } from './Routing';
// import { IRouter, IPopExtrasProps } from './types';
// import { usePanelStateEvents } from '../ui/panel/PanelContext';
// export default {
//   title: 'MemoryNavigation',
//   decorators: [storyAsComponent, AppDecorator],
// };

// let count = 1;

// type PopExtra = { someExtra: string };
// const TestScreen: React.FC<
//   {
//     screnKey: string;
//     withGuard?: boolean;
//     router: IRouter;
//   } & IPopExtrasProps<PopExtra>
// > = (props) => {
//   const { router } = props;
//   const { popScreen, pushScreen, markToClearHistoryUntil } = router;
//   const secondRouter = useRouter('second');
//   const [textState, setTextState] = useState('');
//   const [backToKey, setBackToKey] = useState('');
//   const [backToIncluding, setBackToIncluding] = useState(false);
//   const [popExtra, setPropExtra] = useState('');
//   const [isActive, setIsActive] = useState(false);
//   const [clearHistoryScreenKey, setClearHistoryScreenKey] = useState('');
//   const [including, setIncluding] = useState(false);
//   const [isBackEnabled, setIsBackEnabled] = useState(true);
//   const { cancelSwipe } = usePanelContext();
//   usePanelStateEvents({
//     onBecomeActive: () => {
//       setIsActive(true);
//     },
//   });

//   const handleBack = () => {
//     if (props.withGuard) {
//       const ok = window.confirm('Go Back?');
//       if (ok) {
//         popScreen();
//       } else {
//         cancelSwipe();
//       }
//     } else {
//       popScreen();
//     }
//   };

//   return (
//     <PanelBody>
//       <PanelHeader
//         onLeftAction={isBackEnabled ? handleBack : undefined}
//         leftAction={isBackEnabled ? 'back' : undefined}
//       ></PanelHeader>
//       {props.children}
//       Screen key is {props.screnKey}. is Active {isActive}
//       <button
//         onClick={() => {
//           const newKey = count++;
//           pushScreen({
//             screen: <TestScreen router={router} screnKey={newKey.toString()} />,
//             key: newKey.toString(),
//           });
//         }}
//       >
//         Next
//       </button>
//       <button
//         onClick={() => {
//           const newKey = count++;
//           pushScreen({
//             screen: <TestScreen router={router} withGuard screnKey={newKey.toString()} />,
//             key: newKey.toString(),
//           });
//         }}
//       >
//         Next With Guard
//       </button>
//       <button
//         onClick={() => {
//           const newKey = count++;
//           secondRouter.pushScreen({
//             screen: <TestScreen router={secondRouter} screnKey={newKey.toString()} />,
//             key: newKey.toString(),
//           });
//         }}
//       >
//         Next In Second router
//       </button>
//       <hr />
//       <label>Clear history until Key</label>
//       <input
//         value={clearHistoryScreenKey}
//         onChange={(e) => setClearHistoryScreenKey(e.target.value)}
//       />
//       <label>Including</label>
//       <input type="checkbox" checked={including} onChange={() => setIncluding((s) => !s)} />
//       <button
//         onClick={() => {
//           const newKey = (count++).toString();
//           if (clearHistoryScreenKey) {
//             markToClearHistoryUntil({
//               untilKey: clearHistoryScreenKey,
//               including: including,
//             });
//           }

//           pushScreen({
//             screen: <TestScreen router={router} screnKey={newKey} />,
//             key: newKey,
//           });
//         }}
//       >
//         Push and clear history
//       </button>
//       <hr />
//       <label>Some random state</label>
//       <input value={textState} onChange={(e) => setTextState(e.target.value)} />
//       <label>Pop Extras</label>
//       <p>{props.popExtras?.someExtra}</p>
//       <hr />
//       <label>Pop to Key</label>
//       <input value={backToKey} onChange={(e) => setBackToKey(e.target.value)} />
//       <label>Pop to including</label>
//       <input
//         type="checkbox"
//         checked={backToIncluding}
//         onChange={() => setBackToIncluding((s) => !s)}
//       />
//       <button
//         onClick={() => {
//           popScreen({ toScreen: backToKey, including: backToIncluding });
//         }}
//       >
//         Pop
//       </button>
//       <label>Pop To screen state</label>
//       <input value={popExtra} onChange={(e) => setPropExtra(e.target.value)} />
//       <button
//         onClick={() => {
//           popScreen<PopExtra>({
//             toScreen: backToKey,
//             popExtras: {
//               someExtra: popExtra,
//             },
//           });
//         }}
//       >
//         Pop
//       </button>
//       <div style={{ height: 20, width: 20, background: 'red', zIndex: 100 }}></div>
//       <label>Enable going back</label>
//       <input type="checkbox" checked={isBackEnabled} onChange={() => setIsBackEnabled((s) => !s)} />
//     </PanelBody>
//   );
// };

// const TestContainer: React.FC = (props) => {
//   const router = useRouter();
//   useEffect(() => {
//     const key = (count++).toString();
//     router.pushScreen({
//       screen: <TestScreen router={router} screnKey={key} />,
//       key: key,
//     });
//   }, [router]);

//   return null;
// };

// export const Index = () => {
//   return (
//     <Routing routers={[{}, { key: 'second', zIndex: 10 }]}>
//       <TestContainer />
//     </Routing>
//   );
// };

export {};
