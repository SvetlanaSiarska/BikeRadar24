import { combineReducers } from 'redux'


import { 
        AUTH_LOG_IN,
        AUTH_LOG_OUT
     } from '../actions/types'
import ProductsReducer from './ProductsReducer.js';
import UserReducer from './UserReducer.js';
import PointsReducer from './PointsReducer.js';
import EditedProductReducer from './EditedProductReducer';
import TagsReducer from './TagsReducer';
import PendingUsersReducer from './PendingUsersReducer';
import SuperadminReducer from './SuperadminReducer'
import FilterTagsReducer from './FilterTagsReducer';


const INITIAL_STATE_AUTH = {authenticated: false, currentUserUid:''};

const AuthenticationReducer = (state=INITIAL_STATE_AUTH, action) => {    
    switch(action.type) {
        case AUTH_LOG_IN:   
            return {...state, authenticated: true, currentUserUid: action.payload};
        case AUTH_LOG_OUT:    
        return {...state, authenticated: false, currentUserUid: ''};
        default:
            return state;
    }
};

export default combineReducers( {
    auth: AuthenticationReducer,  
    currentUser: UserReducer,
    pendingUsers: PendingUsersReducer,
    points: PointsReducer,     
    products: ProductsReducer,   
    edited: EditedProductReducer,
    tags: TagsReducer,
    superAdmin: SuperadminReducer,
    filterTags: FilterTagsReducer
   
})