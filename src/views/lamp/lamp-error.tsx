import React, {useMemo} from 'react';
import {createStyles, makeStyles, Theme, useTheme} from '@material-ui/core/styles';
import {color, RGBColor} from 'd3-color';
import {connectInfoStore} from '@/store/info';

const useStyles = makeStyles((theme: Theme) => {
    const defaultBackground = color(theme.palette.background.default) as RGBColor;
    defaultBackground.opacity = 0.85;
    const backgroundColor = defaultBackground.toString();

    return createStyles({
        root: {
            // width: '100%',
            // height: '100%',
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: backgroundColor,
            zIndex: 2,
            paddingTop: 80,
            textAlign: 'center'
        },
        pic: {
            display: 'block',
            height: 270,
            width: 270,
            margin: 'auto'
        },
        text: {
            fontSize: '1.5rem',
            lineHeight: '38px'
        },
        btn: {
            width: 190,
            height: 70,
            lineHeight: '70px',
            borderRadius: 35,
            border: '3px solid #ffffff',
            color: '#ffffff',
            fontSize: '1.5rem',
            margin: '18px auto 0'
        }
    });
});

const ERROR_TYPE = (themeType: string, errorType: string) => {
    const prefix = themeType === 'dark' ? 'b_' : 'w_';
    const errors = {
        default: {
            url: `/images/${prefix}error.png`,
            text: '连接失败',
            btnText: '再试一次'
        },
        netError: {
            url: `/images/${prefix}net_error.png`,
            text: '网络异常',
            btnText: '再试一次'
        }
    };

    //@ts-ignore
    return errors[errorType] || errors.netError;
};

const LampError = (props: any) => {
    const classes = useStyles();
    const theme = useTheme();

    const error = useMemo(() => {
        // @ts-ignore
        return ERROR_TYPE(theme.palette.type, props.info.netError);
    }, [theme.palette.type]);

    return (
        <div className={`${classes.root}`}>
            <img className={`${classes.pic}`} src={error.url} alt={''} />
            <div className={`${classes.text}`}>{error.text}</div>
            <div className={`${classes.btn}`} onClick={() => props.quit()}>
                {error.btnText}
            </div>
        </div>
    );
};

export default connectInfoStore<any>(LampError) as any;
