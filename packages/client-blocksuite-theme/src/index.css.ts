import { globalStyle } from '@vanilla-extract/css';

import {
    combinedLightCssVariables,
    printCssVariables,
    scopedDarkCssVariables,
    scopedLightCssVariables,
} from '@toeverything/theme';

globalStyle(':root', {
    vars: combinedLightCssVariables,
});

globalStyle('[data-theme="light"]', {
    vars: scopedLightCssVariables,
});

globalStyle('[data-theme="dark"]', {
    vars: scopedDarkCssVariables,
});

globalStyle(':root', {
    '@media': {
        print: {
            vars: printCssVariables,
        },
    },
});
