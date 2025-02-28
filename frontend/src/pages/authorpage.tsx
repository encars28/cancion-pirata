import { useQuery } from '@tanstack/react-query';
import { handleError, handleSuccess, getQueryWithParams } from '../utils';
import { AuthorPublicWithPoems } from '../client/types.gen';
import { Loading } from '../components/Loading';
import { authorsReadAuthorById } from '../client/sdk.gen';
import { useParams } from 'react-router';

export function AuthorPage() {
  const params = useParams();
  const authorId = params.id;

  const { isPending, isError, isSuccess, data, error } = useQuery({
    ...getQueryWithParams(`authors/${authorId}`, authorsReadAuthorById, authorId!),
    placeholderData: (prevData) => prevData,
  })

  if (isPending) {
    return (<Loading />)
  }

  if (isError) {
    handleError(error as any);
  }

  if (isSuccess) {
    handleSuccess();
  }

  const author: AuthorPublicWithPoems = data ?? [];

  return (
    <div>
      <h1>Author Page</h1>
      <p>{author.full_name}</p>
    </div>
  )
}