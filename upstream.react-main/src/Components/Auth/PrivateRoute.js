import React, { useEffect} from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './useAuth';

const PrivateRoute = () => {
    const { isLoggedIn } = useAuth();

    useEffect(() => {
    }, [isLoggedIn]);

    return isLoggedIn ? <Outlet /> : <Navigate to='/login' />;
};

export default PrivateRoute;
