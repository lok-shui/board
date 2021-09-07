import React, {useEffect, useState} from 'react';
import {createStyles, makeStyles, Theme, useTheme} from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => {
    return createStyles({
        root: {
            width: '100%',
            height: '100vh',
            position: 'relative',
            backgroundColor: '#ffffff',
            fontSize: '1.5rem'
        },
        header: {
            height: 70,
            textAlign: 'center',
            paddingTop: 24
        },
        headerText: {
            // fontSize: '1.5rem',
            color: '#0188FB'
        },
        mainContain: {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 70,
            bottom: 0,
            overflow: 'auto',
            paddingTop: 15,
            '& .item': {
                marginBottom: 32
            }
        },
        itemTitle: {
            // fontSize: '1.5rem',
            color: '#3D3D3D',
            lineHeight: '26px',
            marginLeft: 30,
            position: 'relative',
            display: 'inline-block',
            '&:after': {
                content: '""',
                position: 'absolute',
                width: 'calc(100% + 16px)',
                height: 9,
                borderRadius: 5,
                backgroundColor: 'rgba(1,136,251,0.45)',
                left: -6,
                bottom: -3
            }
        },
        mathItem: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 22,
            // height: 40,
            // lineHeight: '40px',
            minHeight: 40,
            '& .item-math': {
                color: 'rgba(0,0,0,0.45)'
            }
        },
        mathItemTitle: {
            color: 'rgba(0,0,0,0.45)',
            paddingLeft: 22,
            lineHeight: '26px'
        }
    });
});

// const explainText = [
//     `<math xmlns="http://www.w3.org/1998/Math/MathML"><mn>34</mn><mo>&#xD7;</mo><mn>27</mn><mo>+</mo><mn>57</mn><mo>&#xD7;</mo><mn>34</mn></math>`,
//     `<math xmlns="http://www.w3.org/1998/Math/MathML"><mn>15</mn><mo>&#xD7;</mo><mo>&#x25A1;</mo><mo>=</mo><mn>150</mn></math>`,
//     `<math xmlns="http://www.w3.org/1998/Math/MathML"><mn>1</mn><mo>-</mo><mfrac><mfenced><mrow><mo>&#xA0;</mo><mo>&#xA0;</mo><mo>&#xA0;</mo></mrow></mfenced><mn>7</mn></mfrac><mo>+</mo><mfrac><mn>2</mn><mn>7</mn></mfrac><mo>=</mo><mfrac><mn>4</mn><mn>7</mn></mfrac></math>`,
//     `<math xmlns="http://www.w3.org/1998/Math/MathML"><mn>64</mn><mo>+</mo><mn>67</mn><mo>-</mo><mn>45</mn><mo>+</mo><mfrac><mn>2</mn><mn>5</mn></mfrac><mo>-</mo><mn>30</mn><mo>%</mo></math>`,
//     `<math xmlns="http://www.w3.org/1998/Math/MathML"><mn>12</mn><mo>.</mo><mn>5</mn><mo>&#xD7;</mo><mn>80</mn><mo>&#xF7;</mo><mn>2</mn><mo>%</mo></math>`,
//     `<math xmlns="http://www.w3.org/1998/Math/MathML"><mn>12</mn><mo>.</mo><mn>5</mn><mo>&#xD7;</mo><mfenced><mrow><mn>8</mn><mo>+</mo><mn>100</mn></mrow></mfenced></math>`,
//     `<math xmlns="http://www.w3.org/1998/Math/MathML"><mn>18</mn><mo>:</mo><mfrac><mn>2</mn><mn>3</mn></mfrac></math>`,
//     `<math xmlns="http://www.w3.org/1998/Math/MathML"><mn>18</mn><mo>&#xF7;</mo><mi>x</mi><mo>=</mo><mn>6</mn></math>`
// ];

const explainHtml = [
    `<mjx-container class="MathJax" jax="CHTML" role="presentation" style="position: relative;"><mjx-math class="MJX-TEX" aria-hidden="true"><mjx-mn class="mjx-n"><mjx-c class="mjx-c33"></mjx-c><mjx-c class="mjx-c34"></mjx-c></mjx-mn><mjx-mo class="mjx-n" space="3"><mjx-c class="mjx-cD7"></mjx-c></mjx-mo><mjx-mn class="mjx-n" space="3"><mjx-c class="mjx-c32"></mjx-c><mjx-c class="mjx-c37"></mjx-c></mjx-mn><mjx-mo class="mjx-n" space="3"><mjx-c class="mjx-c2B"></mjx-c></mjx-mo><mjx-mn class="mjx-n" space="3"><mjx-c class="mjx-c35"></mjx-c><mjx-c class="mjx-c37"></mjx-c></mjx-mn><mjx-mo class="mjx-n" space="3"><mjx-c class="mjx-cD7"></mjx-c></mjx-mo><mjx-mn class="mjx-n" space="3"><mjx-c class="mjx-c33"></mjx-c><mjx-c class="mjx-c34"></mjx-c></mjx-mn></mjx-math><mjx-assistive-mml role="presentation" unselectable="on" display="block"><math xmlns="http://www.w3.org/1998/Math/MathML"><mn>34</mn><mo>×</mo><mn>27</mn><mo>+</mo><mn>57</mn><mo>×</mo><mn>34</mn></math></mjx-assistive-mml></mjx-container>`,
    `<mjx-container class="MathJax" jax="CHTML" role="presentation" style="position: relative;"><mjx-math class="MJX-TEX" aria-hidden="true"><mjx-mn class="mjx-n"><mjx-c class="mjx-c31"></mjx-c><mjx-c class="mjx-c35"></mjx-c></mjx-mn><mjx-mo class="mjx-n" space="3"><mjx-c class="mjx-cD7"></mjx-c></mjx-mo><mjx-mo class="mjx-n" space="3"><mjx-c class="mjx-c25A1 TEX-A"></mjx-c></mjx-mo><mjx-mo class="mjx-n" space="4"><mjx-c class="mjx-c3D"></mjx-c></mjx-mo><mjx-mn class="mjx-n" space="4"><mjx-c class="mjx-c31"></mjx-c><mjx-c class="mjx-c35"></mjx-c><mjx-c class="mjx-c30"></mjx-c></mjx-mn></mjx-math><mjx-assistive-mml role="presentation" unselectable="on" display="block"><math xmlns="http://www.w3.org/1998/Math/MathML"><mn>15</mn><mo>×</mo><mo>□</mo><mo>=</mo><mn>150</mn></math></mjx-assistive-mml></mjx-container>`,
    `<mjx-container class="MathJax" jax="CHTML" role="presentation" style="position: relative;"><mjx-math class="MJX-TEX" aria-hidden="true"><mjx-mn class="mjx-n"><mjx-c class="mjx-c31"></mjx-c></mjx-mn><mjx-mo class="mjx-n" space="3"><mjx-c class="mjx-c2212"></mjx-c></mjx-mo><mjx-mfrac space="3"><mjx-frac><mjx-num><mjx-nstrut></mjx-nstrut><mjx-mfenced size="s"><mjx-mo class="mjx-n"><mjx-c class="mjx-c28"></mjx-c></mjx-mo><mjx-mrow><mjx-mo class="mjx-n"><mjx-c class="mjx-cA0"></mjx-c></mjx-mo><mjx-mo class="mjx-n"><mjx-c class="mjx-cA0"></mjx-c></mjx-mo><mjx-mo class="mjx-n"><mjx-c class="mjx-cA0"></mjx-c></mjx-mo></mjx-mrow><mjx-mo class="mjx-n"><mjx-c class="mjx-c29"></mjx-c></mjx-mo></mjx-mfenced></mjx-num><mjx-dbox><mjx-dtable><mjx-line></mjx-line><mjx-row><mjx-den><mjx-dstrut></mjx-dstrut><mjx-mn class="mjx-n" size="s"><mjx-c class="mjx-c37"></mjx-c></mjx-mn></mjx-den></mjx-row></mjx-dtable></mjx-dbox></mjx-frac></mjx-mfrac><mjx-mo class="mjx-n" space="3"><mjx-c class="mjx-c2B"></mjx-c></mjx-mo><mjx-mfrac space="3"><mjx-frac><mjx-num><mjx-nstrut></mjx-nstrut><mjx-mn class="mjx-n" size="s"><mjx-c class="mjx-c32"></mjx-c></mjx-mn></mjx-num><mjx-dbox><mjx-dtable><mjx-line></mjx-line><mjx-row><mjx-den><mjx-dstrut></mjx-dstrut><mjx-mn class="mjx-n" size="s"><mjx-c class="mjx-c37"></mjx-c></mjx-mn></mjx-den></mjx-row></mjx-dtable></mjx-dbox></mjx-frac></mjx-mfrac><mjx-mo class="mjx-n" space="4"><mjx-c class="mjx-c3D"></mjx-c></mjx-mo><mjx-mfrac space="4"><mjx-frac><mjx-num><mjx-nstrut></mjx-nstrut><mjx-mn class="mjx-n" size="s"><mjx-c class="mjx-c34"></mjx-c></mjx-mn></mjx-num><mjx-dbox><mjx-dtable><mjx-line></mjx-line><mjx-row><mjx-den><mjx-dstrut></mjx-dstrut><mjx-mn class="mjx-n" size="s"><mjx-c class="mjx-c37"></mjx-c></mjx-mn></mjx-den></mjx-row></mjx-dtable></mjx-dbox></mjx-frac></mjx-mfrac></mjx-math><mjx-assistive-mml role="presentation" unselectable="on" display="block"><math xmlns="http://www.w3.org/1998/Math/MathML"><mn>1</mn><mo>-</mo><mfrac><mfenced><mrow><mo>&nbsp;</mo><mo>&nbsp;</mo><mo>&nbsp;</mo></mrow></mfenced><mn>7</mn></mfrac><mo>+</mo><mfrac><mn>2</mn><mn>7</mn></mfrac><mo>=</mo><mfrac><mn>4</mn><mn>7</mn></mfrac></math></mjx-assistive-mml></mjx-container>`,
    `<mjx-container class="MathJax" jax="CHTML" role="presentation" style="position: relative;"><mjx-math class="MJX-TEX" aria-hidden="true"><mjx-mn class="mjx-n"><mjx-c class="mjx-c36"></mjx-c><mjx-c class="mjx-c34"></mjx-c></mjx-mn><mjx-mo class="mjx-n" space="3"><mjx-c class="mjx-c2B"></mjx-c></mjx-mo><mjx-mn class="mjx-n" space="3"><mjx-c class="mjx-c36"></mjx-c><mjx-c class="mjx-c37"></mjx-c></mjx-mn><mjx-mo class="mjx-n" space="3"><mjx-c class="mjx-c2212"></mjx-c></mjx-mo><mjx-mn class="mjx-n" space="3"><mjx-c class="mjx-c34"></mjx-c><mjx-c class="mjx-c35"></mjx-c></mjx-mn><mjx-mo class="mjx-n" space="3"><mjx-c class="mjx-c2B"></mjx-c></mjx-mo><mjx-mfrac space="3"><mjx-frac><mjx-num><mjx-nstrut></mjx-nstrut><mjx-mn class="mjx-n" size="s"><mjx-c class="mjx-c32"></mjx-c></mjx-mn></mjx-num><mjx-dbox><mjx-dtable><mjx-line></mjx-line><mjx-row><mjx-den><mjx-dstrut></mjx-dstrut><mjx-mn class="mjx-n" size="s"><mjx-c class="mjx-c35"></mjx-c></mjx-mn></mjx-den></mjx-row></mjx-dtable></mjx-dbox></mjx-frac></mjx-mfrac><mjx-mo class="mjx-n" space="3"><mjx-c class="mjx-c2212"></mjx-c></mjx-mo><mjx-mn class="mjx-n" space="3"><mjx-c class="mjx-c33"></mjx-c><mjx-c class="mjx-c30"></mjx-c></mjx-mn><mjx-mo class="mjx-n"><mjx-c class="mjx-c25"></mjx-c></mjx-mo></mjx-math><mjx-assistive-mml role="presentation" unselectable="on" display="block"><math xmlns="http://www.w3.org/1998/Math/MathML"><mn>64</mn><mo>+</mo><mn>67</mn><mo>-</mo><mn>45</mn><mo>+</mo><mfrac><mn>2</mn><mn>5</mn></mfrac><mo>-</mo><mn>30</mn><mo>%</mo></math></mjx-assistive-mml></mjx-container>`,
    `<mjx-container class="MathJax" jax="CHTML" role="presentation" style="position: relative;"><mjx-math class="MJX-TEX" aria-hidden="true"><mjx-mn class="mjx-n"><mjx-c class="mjx-c31"></mjx-c><mjx-c class="mjx-c32"></mjx-c></mjx-mn><mjx-mo class="mjx-n"><mjx-c class="mjx-c2E"></mjx-c></mjx-mo><mjx-mn class="mjx-n" space="2"><mjx-c class="mjx-c35"></mjx-c></mjx-mn><mjx-mo class="mjx-n" space="3"><mjx-c class="mjx-cD7"></mjx-c></mjx-mo><mjx-mn class="mjx-n" space="3"><mjx-c class="mjx-c38"></mjx-c><mjx-c class="mjx-c30"></mjx-c></mjx-mn><mjx-mo class="mjx-n" space="3"><mjx-c class="mjx-cF7"></mjx-c></mjx-mo><mjx-mn class="mjx-n" space="3"><mjx-c class="mjx-c32"></mjx-c></mjx-mn><mjx-mo class="mjx-n"><mjx-c class="mjx-c25"></mjx-c></mjx-mo></mjx-math><mjx-assistive-mml role="presentation" unselectable="on" display="block"><math xmlns="http://www.w3.org/1998/Math/MathML"><mn>12</mn><mo>.</mo><mn>5</mn><mo>×</mo><mn>80</mn><mo>÷</mo><mn>2</mn><mo>%</mo></math></mjx-assistive-mml></mjx-container>`,
    `<mjx-container class="MathJax" jax="CHTML" role="presentation" style="position: relative;"><mjx-math class="MJX-TEX" aria-hidden="true"><mjx-mn class="mjx-n"><mjx-c class="mjx-c31"></mjx-c><mjx-c class="mjx-c32"></mjx-c></mjx-mn><mjx-mo class="mjx-n"><mjx-c class="mjx-c2E"></mjx-c></mjx-mo><mjx-mn class="mjx-n" space="2"><mjx-c class="mjx-c35"></mjx-c></mjx-mn><mjx-mo class="mjx-n" space="3"><mjx-c class="mjx-cD7"></mjx-c></mjx-mo><mjx-mfenced space="3"><mjx-mo class="mjx-n"><mjx-c class="mjx-c28"></mjx-c></mjx-mo><mjx-mrow><mjx-mn class="mjx-n"><mjx-c class="mjx-c38"></mjx-c></mjx-mn><mjx-mo class="mjx-n" space="3"><mjx-c class="mjx-c2B"></mjx-c></mjx-mo><mjx-mn class="mjx-n" space="3"><mjx-c class="mjx-c31"></mjx-c><mjx-c class="mjx-c30"></mjx-c><mjx-c class="mjx-c30"></mjx-c></mjx-mn></mjx-mrow><mjx-mo class="mjx-n"><mjx-c class="mjx-c29"></mjx-c></mjx-mo></mjx-mfenced></mjx-math><mjx-assistive-mml role="presentation" unselectable="on" display="block"><math xmlns="http://www.w3.org/1998/Math/MathML"><mn>12</mn><mo>.</mo><mn>5</mn><mo>×</mo><mfenced><mrow><mn>8</mn><mo>+</mo><mn>100</mn></mrow></mfenced></math></mjx-assistive-mml></mjx-container>`,
    `<mjx-container class="MathJax" jax="CHTML" role="presentation" style="position: relative;"><mjx-math class="MJX-TEX" aria-hidden="true"><mjx-mn class="mjx-n"><mjx-c class="mjx-c31"></mjx-c><mjx-c class="mjx-c38"></mjx-c></mjx-mn><mjx-mo class="mjx-n" space="4"><mjx-c class="mjx-c3A"></mjx-c></mjx-mo><mjx-mfrac space="4"><mjx-frac><mjx-num><mjx-nstrut></mjx-nstrut><mjx-mn class="mjx-n" size="s"><mjx-c class="mjx-c32"></mjx-c></mjx-mn></mjx-num><mjx-dbox><mjx-dtable><mjx-line></mjx-line><mjx-row><mjx-den><mjx-dstrut></mjx-dstrut><mjx-mn class="mjx-n" size="s"><mjx-c class="mjx-c33"></mjx-c></mjx-mn></mjx-den></mjx-row></mjx-dtable></mjx-dbox></mjx-frac></mjx-mfrac></mjx-math><mjx-assistive-mml role="presentation" unselectable="on" display="block"><math xmlns="http://www.w3.org/1998/Math/MathML"><mn>18</mn><mo>:</mo><mfrac><mn>2</mn><mn>3</mn></mfrac></math></mjx-assistive-mml></mjx-container>`,
    `<mjx-container class="MathJax" jax="CHTML" role="presentation" style="position: relative;"><mjx-math class="MJX-TEX" aria-hidden="true"><mjx-mn class="mjx-n"><mjx-c class="mjx-c31"></mjx-c><mjx-c class="mjx-c38"></mjx-c></mjx-mn><mjx-mo class="mjx-n" space="3"><mjx-c class="mjx-cF7"></mjx-c></mjx-mo><mjx-mi class="mjx-i" space="3"><mjx-c class="mjx-c1D465 TEX-I"></mjx-c></mjx-mi><mjx-mo class="mjx-n" space="4"><mjx-c class="mjx-c3D"></mjx-c></mjx-mo><mjx-mn class="mjx-n" space="4"><mjx-c class="mjx-c36"></mjx-c></mjx-mn></mjx-math><mjx-assistive-mml role="presentation" unselectable="on" display="block"><math xmlns="http://www.w3.org/1998/Math/MathML"><mn>18</mn><mo>÷</mo><mi>x</mi><mo>=</mo><mn>6</mn></math></mjx-assistive-mml></mjx-container>`
];

const icon = {
    correct: '/images/icon_correct.png',
    error: '/images/icon_error.png'
};

export default () => {
    const classes = useStyles();

    useEffect(() => {
        const els = document.querySelectorAll('.item-math');
        els.forEach((el, index) => {
            el.innerHTML = explainHtml[index];
        });
    }, []);

    return (
        <div className={`${classes.root} lamp`}>
            <div className={`${classes.header}`}>
                <div className={`${classes.headerText}`}>可讲解范围说明</div>
            </div>
            <div className={`${classes.mainContain}`}>
                <div className={`item`}>
                    <div className={`${classes.itemTitle}`}>小学范围完整算式</div>
                    <div>
                        <div className={`${classes.mathItem}`} style={{width: '320px'}}>
                            <div className={`item-math`}></div>
                            <img style={{width: '30px', height: '24px'}} src={icon.correct} alt={''} />
                        </div>
                        <div className={`${classes.mathItem}`} style={{width: '320px'}}>
                            <div className={`item-math`}></div>
                            <img style={{width: '24px', height: '24px'}} src={icon.error} alt={''} />
                        </div>
                        <div className={`${classes.mathItem}`} style={{width: '320px', marginTop: '16px'}}>
                            <div className={`item-math`}></div>
                            <img style={{width: '24px', height: '24px'}} src={icon.error} alt={''} />
                        </div>
                    </div>
                </div>

                <div className={`item`}>
                    <div className={`${classes.itemTitle}`}>支持运算类型</div>
                    <div>
                        <div className={`${classes.mathItemTitle}`}>加减运算</div>
                        <div className={`${classes.mathItem}`} style={{width: '320px'}}>
                            <div className={`item-math`}></div>
                            <img style={{width: '30px', height: '24px'}} src={icon.correct} alt={''} />
                        </div>

                        <div className={`${classes.mathItemTitle}`} style={{marginTop: '24px'}}>
                            乘除运算
                        </div>
                        <div className={`${classes.mathItem}`} style={{width: '320px'}}>
                            <div className={`item-math`}></div>
                            <img style={{width: '30px', height: '24px'}} src={icon.correct} alt={''} />
                        </div>

                        <div className={`${classes.mathItemTitle}`} style={{marginTop: '24px'}}>
                            混合运算
                        </div>
                        <div className={`${classes.mathItem}`} style={{width: '320px'}}>
                            <div className={`item-math`}></div>
                            <img style={{width: '30px', height: '24px'}} src={icon.correct} alt={''} />
                        </div>
                    </div>
                </div>

                <div className={`item`}>
                    <div className={`${classes.itemTitle}`}>特别说明</div>
                    <div>
                        <div className={`${classes.mathItemTitle}`}>暂不支持比例、方程讲解</div>
                        <div className={`${classes.mathItem}`} style={{width: '180px', marginTop: '16px'}}>
                            <div className={`item-math`}></div>
                            <img style={{width: '24px', height: '24px'}} src={icon.error} alt={''} />
                        </div>
                        <div className={`${classes.mathItem}`} style={{width: '180px'}}>
                            <div className={`item-math`}></div>
                            <img style={{width: '24px', height: '24px'}} src={icon.error} alt={''} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
