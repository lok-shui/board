import React, {useEffect} from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {HashRouter, Redirect, Route, Switch} from 'react-router-dom';
import {Provider} from 'react-redux';
import store from './store';
import './plugins';
import {ThemeProvider} from '@material-ui/styles';
import createTheme from '@/theme';
import {getQueryVariable} from '@/utils';
import Lamp from './views/lamp/index';
import LampExplain from './views/lamp/lamp-explain';

const themeParams = getQueryVariable('theme');

export const theme = createTheme(themeParams as any);

function Main() {
    return (
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <HashRouter>
                    <Switch>
                        <Route path="/tutor-board" exact component={App}></Route>
                        <Route path="/lamp" exact component={Lamp}></Route>
                        <Route path="/LampExplain" exact component={LampExplain}></Route>
                        <Redirect to={{pathname: '/tutor-board'}} />
                    </Switch>
                </HashRouter>
            </ThemeProvider>
        </Provider>
    );
}

ReactDOM.render(<Main />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
