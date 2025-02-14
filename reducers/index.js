import { combineReducers } from '@reduxjs/toolkit';

import auth from './auth_reducer';
import camera from './camera_reducer';
import gallery from './gallery_reducer';
import images from './images_reducer';
import my_uploads_reducer from "./my_uploads_reducer";
import leaderboard from './leaderboards_reducer';
import litter from './litter_reducer';
import shared from './shared_reducer';
import settings from './settings_reducer';
import stats from './stats_reducer';
import teams from './team_reducer';
import web from './web_reducer';

export const rootReducer = combineReducers({
    auth,
    camera,
    gallery,
    images,
    my_uploads_reducer,
    leaderboard,
    litter,
    shared,
    settings,
    stats,
    teams,
    web
});
