import React from "react";
import { ChakraProvider, theme } from "@chakra-ui/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Provider } from 'react-redux';
import store from './ReduxToolkit/store';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from './components/Navbar';
import MyNfts from "./components/MyNfts";
import Home from "./components/Home";
import NFTList from "./components/NFTList";
import NFTAuction from "./components/NFTAuction"


function App() {
  return (
 
      <ChakraProvider theme={theme}>
        <ToastContainer />
        <Provider store={store}>
          <Router>
            <Navbar />
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/nftlist" element={<NFTList />} />
              <Route path="/mynfts" element={<MyNfts />} />
              <Route path="/nftauction" element={<NFTAuction />} />
            </Routes>
          </Router>
        </Provider>
      </ChakraProvider>
    
  );
}

export default App;
