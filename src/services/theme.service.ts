import {Observable, ReplaySubject} from 'rxjs';
import {map, share} from 'rxjs/operators';
import {THEME_DARK, THEME_LIGHT} from './themes';

const themeOptions: JSThemeOptions[] = [THEME_DARK, THEME_LIGHT];

export interface JSThemeOptions {
    name: string;
    base?: string;
    variables?: JSThemeVariable;
}

export interface JSThemeVariable {
    [key: string]: string | string[] | JSThemeVariable;
}

const genColorVariableName = (name: string): string => `--v-${name}`;
const genColorVariable = (name: string): string => `var(${genColorVariableName(name)})`;

const genStyles = (them: JSThemeOptions): string => {
    const {variables} = them;
    if (!variables) return '';

    const variants = Object.keys(variables);
    let variablesCss = '';

    for (let i = 0; i < variants.length; i++) {
        const name = variants[i];
        const variantValue = variables[name];

        variablesCss += `  ${genColorVariableName(name)}: ${variantValue};\n`;
    }

    variablesCss = `\n:root {\n${variablesCss}}\n`;
    return variablesCss;
};

class JSThemeService {
    private themes: any = {};
    private styleSheet!: HTMLStyleElement;

    currentTheme!: string;
    private themeChanges$ = new ReplaySubject(1);

    constructor(options: {name: string}, themes: JSThemeOptions[] = themeOptions) {
        themes.forEach(theme => this.register(theme, theme.name));

        options.name && this.changeTheme(options.name);
    }

    set css(value: string) {
        this.checkStyleSheet() && (this.styleSheet.innerHTML = value);
    }

    private register(config: any, themeName: string) {
        this.themes[themeName] = config;
    }

    private getTheme(themeName: string) {
        return JSON.parse(JSON.stringify(this.themes[themeName]));
    }

    getJSTheme() {
        return this.onThemeChange().pipe(map(({name}) => this.getTheme(name)));
    }

    changeTheme(name: string) {
        if (name === this.currentTheme) return;

        this.themeChanges$.next({name, previous: this.currentTheme});
        this.currentTheme = name;
        this.applyTheme();
    }

    private onThemeChange(): Observable<any> {
        return this.themeChanges$.pipe(share());
    }

    private checkStyleSheet() {
        this.styleSheet = document.getElementById('cssVars') as HTMLStyleElement;
        if (this.styleSheet) return true;

        this.genStyleSheet();
        return Boolean(this.styleSheet);
    }

    private genStyleSheet() {
        if (typeof document === 'undefined') return;

        this.styleSheet = document.createElement('style');
        this.styleSheet.type = 'text/css';
        this.styleSheet.id = 'cssVars';

        document.head.appendChild(this.styleSheet);
    }

    private applyTheme() {
        this.css = genStyles(this.getTheme(this.currentTheme));
    }
}

export default new JSThemeService({name: 'dark'});
