import 'animate.css/animate.css';
import '@/styles/styles.scss';

import {showMathMl} from '@/utils';

declare var MathJax: any;
// @ts-ignore
import('./assets/mml-chtml.js').then(() => {
    showMathMl(document.getElementById('math_font_preload'));
});
