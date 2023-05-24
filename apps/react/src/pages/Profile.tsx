import { useParams } from 'react-router-dom';
import { Spinner } from '@material-tailwind/react';
import { useMe, useUser } from '../hooks/useUser';

export function ProfilePage() {
	const { username } = useParams();
	const { isLoading: isLoadingMe /*, me*/ } = useMe();
	const { isLoading: isLoadingUser, user } = useUser(username || '');

	if (isLoadingMe || isLoadingUser) {
		return <Spinner />;
	}
	if (!user) {
		return <h2>User not Found</h2>;
	}
	return <></>;
}
