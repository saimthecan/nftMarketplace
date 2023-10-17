import React from "react";
import { ChakraProvider, theme } from "@chakra-ui/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Provider } from 'react-redux';
import store from './ReduxToolkit/store';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from './components/Navbar';
import MyNfts from "./components/MyNfts";



function App() {
  return (
 
      <ChakraProvider theme={theme}>
        <ToastContainer />
        <Provider store={store}>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<MyNfts />} />
            </Routes>
          </Router>
        </Provider>
      </ChakraProvider>
    
  );
}

export default App;
