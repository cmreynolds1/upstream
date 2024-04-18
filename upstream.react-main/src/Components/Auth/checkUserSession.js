import { getCurrentUser } from 'aws-amplify/auth';

export const checkUserSession = async () => {
    try {
        const user = await getCurrentUser();
        console.log("User is signed in", user);
        return true;
    } catch (error) {
        console.error('User is not signed in:', error);
        return false;
    }
};
