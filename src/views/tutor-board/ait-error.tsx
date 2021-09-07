import React, {useMemo} from 'react';
import {createStyles, makeStyles, Theme, useTheme} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import {color, RGBColor} from 'd3-color';
import {connectInfoStore} from '@/store/info';

const useStyles = makeStyles((theme: Theme) => {
    const defaultBackground = color(theme.palette.background.default) as RGBColor;
    defaultBackground.opacity = 0.8;
    const backgroundColor = defaultBackground.toString();

    return createStyles({
        root: {
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: backgroundColor,
            zIndex: 2
        },
        pic: {
            display: 'block',
            height: 205,
            width: 205
        },
        wrap: {
            marginTop: '30%'
        }
    });
});
const ERROR_TYPE = (themeType: string, errorType: string) => {
    const prefix = themeType === 'dark' ? 'b_' : 'w_';
    const errors = {
        default: {
            url: `/images/${prefix}error.png`,
            text: '开小差了，请稍后再次尝试',
            btn: true
        },
        idError: {
            url: `/images/${prefix}id_error.png`,
            text: '没有找到这道题，请检查题目ID。',
            btn: true
        },
        netError: {
            url: `/images/${prefix}net_error.png`,
            text: '网络加载出错，请检查网络。',
            btn: false
        },
        none: {
            url: `/images/${prefix}none_error.png`,
            text: '我还在学习怎么解这道题呢！',
            btn: false
        }
    };

    // @ts-ignore
    return errors[errorType] || errors.default;
};

const AitError = (props: any) => {
    const classes = useStyles();
    const theme = useTheme();

    const error = useMemo(() => {
        // @ts-ignore
        return ERROR_TYPE(theme.palette.type, props.info.netError);
    }, [theme.palette.type]);

    return (
        <div className={`${classes.root}`}>
            <div className={`d-flex flex-column align-center ${classes.wrap}`}>
                <img className={`${classes.pic}`} src={error.url} alt={''} />

                <div style={{marginTop: 30}}>{error.text}</div>

                {error.btn && (
                    <Button
                        color="primary"
                        variant="contained"
                        disableElevation
                        style={{marginTop: 20, backgroundColor: '#51A0FF'}}
                        onClick={() => window.location.reload()}>
                        重新加载
                    </Button>
                )}
            </div>
        </div>
    );
};

export default connectInfoStore<any>(AitError) as any;
