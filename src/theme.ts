import {createMuiTheme, ThemeOptions} from '@material-ui/core/styles';

const aidShape = {
    lineHeight: 3
};

const THEME: Record<'dark' | 'light', ThemeOptions> = {
    dark: {
        palette: {
            type: 'dark',
            background: {
                paper: 'rgba(53,54,57,1)',
                default: 'rgba(37,36,39, 1)'
            },
            text: {
                primary: '#FFFFFF'
            }
        },
        aid: {
            line: '#BFBFBF',
            lineText: '#BFBFBF',
            mark: '#51AFFF',
            area: 'rgba(81, 175, 255, 0.2)',
            fill: 'rgba(81, 160, 255, 0.65)',
            text: '#FFFFFF',
            dotFill: '#FFFFFF00',
            ...aidShape
        }
    },
    light: {
        palette: {
            type: 'light',
            background: {
                paper: 'rgba(255,255,255,1)',
                default: 'rgba(245,245,245,1)'
            },
            text: {
                primary: '#000000'
            }
        },
        aid: {
            line: '#BFBFBF',
            lineText: '#666666',
            mark: '#51AFFF',
            area: 'rgba(81, 175, 255, 0.2)',
            fill: 'rgba(81, 160, 255, 0.65)',
            text: '#333333',
            dotFill: '#FFFFFF',
            ...aidShape
        }
    }
};

const mixinOptions = {
    orientation: {
        landscape: '@media screen and (orientation: landscape)',
        portrait: '@media screen and (orientation: portrait)'
    }
};

const THEME_TYPES = ['light', 'dark'];

export default function (type: 'light' | 'dark') {
    if (!THEME_TYPES.includes(type)) type = 'light';

    return createMuiTheme(Object.assign({}, THEME[type], mixinOptions));
}

declare module '@material-ui/core/styles/createMuiTheme' {
    interface Theme {
        aid: {
            line: string;
            lineText: string;
            mark: string;
            area: string;
            fill: string;
            text: string;
            dotFill: string;
            lineHeight: number;
        };

        orientation: {
            landscape: string;
            portrait: string;
        };
    }
    // allow configuration using `createMuiTheme`
    interface ThemeOptions {
        aid?: {
            line: string;
            lineText: string;
            mark: string;
            area: string;
            fill: string;
            text: string;
            dotFill: string;
            lineHeight: number;
        };
    }
}
