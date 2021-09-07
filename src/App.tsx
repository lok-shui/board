import React, {useEffect, useState} from 'react';
import TutorBoard from './views/tutor-board';
import TutorBoardLandscape from './views/tutor-board/landscape';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import {useWindowSize} from 'react-use';
import store from '@/store';
import {InfoActions} from '@/store/info';
import {SnackbarProvider, VariantType, useSnackbar} from 'notistack';
import eventemitter from '@/utils/event';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            color: theme.palette.text.primary
        }
    })
);

declare var window: any;

function App() {
    const classes = useStyles();
    const [mode, setMode] = useState('');
    const {width, height} = useWindowSize();
    const {enqueueSnackbar} = useSnackbar();

    useEffect(() => {
        const type = width > height && width >= 600;
        setMode(type ? 'landscape' : 'vertical');
        store.dispatch({type: InfoActions.setLandscapeMode, payload: type});
    }, []);

    useEffect(() => {
        const handleSnackbar = (message: string, variant: VariantType = 'error') => {
            enqueueSnackbar(message, {variant});
        };
        eventemitter.on('snackbar', handleSnackbar);

        // store.dispatch({type: InfoActions.setLandscapeMode, payload: false});
        window.getFontSize = () => false;
        window.resetFontSize = () => {};

        return () => {
            eventemitter.off('snackbar', handleSnackbar);
        };
    }, []);

    return (
        <div className={`App ${classes.root}`} id="app">
            {mode === 'vertical' && <TutorBoard />}
            {mode === 'landscape' && <TutorBoardLandscape />}
            {/* <TutorBoard></TutorBoard> */}
        </div>
    );
}

function IntegrationNotistack() {
    return (
        <SnackbarProvider maxSnack={3}>
            <App />
        </SnackbarProvider>
    );
}

export default IntegrationNotistack;
