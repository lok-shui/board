import React, {useEffect, useMemo, useState} from 'react';
import {createStyles, makeStyles, Theme, useTheme} from '@material-ui/core/styles';
import {connectInfoStore} from '@/store/info';
import {useLocation} from 'react-router';
import ArrowBackIosRoundedIcon from '@material-ui/icons/ArrowBackIosRounded';
import {questions as questionsApi} from '@/api';
import {showMathMl} from '@/utils';
import Divider from '@material-ui/core/Divider';
import CheckIcon from '@material-ui/icons/Check';

const useStyles = makeStyles((theme: Theme) => {
    const backgroundUrl = theme.palette.type === 'dark' ? '/images/background.jpg' : '/images/background_white.jpg';

    return createStyles({
        root: {
            position: 'fixed',
            height: `100vh`,
            width: '100vw',
            background: `url('${backgroundUrl}') repeat`,
            zIndex: 99,
            overflow: 'hidden'
        },
        header: {
            position: 'relative',
            height: 45,
            lineHeight: '45px',
            fontSize: 21,
            color: theme.palette.text.primary,
            padding: '0 15px',
            transition: 'height 300ms, color 300ms',
            fontWeight: 400
        },
        navIcon: {
            position: 'relative',
            bottom: 1,
            height: '100%',
            fontSize: 18,
            padding: 4,
            marginLeft: -4,
            marginRight: 4
        },
        question: {
            padding: '40px 24px 18px',
            maxHeight: '50vh',
            overflow: 'auto',
            '& *': {
                maxWidth: '100%'
            }
        },
        content: {
            overflow: 'auto'
        },
        chooseItem: {
            height: 50,
            padding: '0 24px',
            lineHeight: '50px'
        }
    });
});

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const AitError = (props: any) => {
    const classes = useStyles();
    const query = useQuery();
    const stateBarH = useMemo(() => query.get('stateBarH') || 0, [query]);
    const [stem, setStem] = useState('');
    const [loaded, setLoaded] = useState(false);
    const [pgs, setPgs] = useState([] as {name: string; pg: string}[]);

    const removeHeader = useMemo(() => {
        return !!query.get('removeHeader');
    }, []);

    useEffect(() => {
        if (!props.questionId) return;
        questionsApi
            .availablePgs(props.questionId)
            .then(data => {
                let {stem} = data.questionContent;
                let availablePgs = data.availablePgs || [];

                setStem(stem);
                setPgs(availablePgs);

                props.hasPgs(availablePgs.length > 1);
                availablePgs.length <= 1 && props.hide();
            })
            .catch(() => {
                props.hide();
            })
            .finally(() => {
                setLoaded(true);
            });
    }, []);

    useEffect(() => {
        (async () => {
            await showMathMl(document.getElementById('question_stem'));
        })();
    }, [stem]);

    return (
        <div
            className={`${classes.root} flex-column`}
            style={{visibility: loaded ? undefined : 'hidden', display: props.hilcChooseVisible ? 'flex' : 'none'}}>
            <div style={{height: stateBarH + 'px'}} className="d-flex align-center flex-shrink-0" />

            {/*头部*/}
            {!removeHeader && (
                <div className={`${classes.header} d-flex align-center flex-shrink-0`}>
                    <div className={`${classes.navIcon} d-flex align-center scale-btn`} onClick={() => back()}>
                        <ArrowBackIosRoundedIcon style={{fontSize: 'inherit'}} />
                    </div>
                    <div>返回计算</div>

                    <div className="flex-grow-1" />
                    {props.info.pgId && (
                        <div style={{color: '#51A0FF'}} onClick={() => props.hide()}>
                            返回讲解
                        </div>
                    )}
                </div>
            )}

            {/*题目*/}
            <div className={`${classes.question} d-flex flex-column flex-shrink-0`}>
                <div id="question_stem" dangerouslySetInnerHTML={{__html: stem}} />
                <div className="d-flex justify-center pt-2" style={{fontSize: '12px'}}>
                    请选择一种计算方法
                </div>
            </div>

            {/*类型选择*/}
            {loaded && (
                <div className={`${classes.content} flex-grow-1`}>
                    {pgs.map(({name, pg}) => (
                        <div
                            key={pg}
                            onClick={() => {
                                props.setPgId(pg);
                                props.hide();
                            }}>
                            <Divider />
                            <div className={`${classes.chooseItem} d-flex align-center`}>
                                <span>{name}</span>
                                <div className="flex-grow-1" />
                                {props.info.pgId === pg && <CheckIcon style={{color: '#1890FF'}} />}
                            </div>
                        </div>
                    ))}
                    <Divider />
                </div>
            )}
        </div>
    );
};

function back() {
    try {
        if (navigator.userAgent.includes('dm-ait-flutter')) {
            const json = '{"action":"back"}';
            // @ts-ignore
            window.DM.postMessage(json);
        } else {
            // @ts-ignore
            window.dm.exit();
        }
    } catch (e) {
        console.error(e.message);
    }
}
export default connectInfoStore<any>(AitError) as any;
