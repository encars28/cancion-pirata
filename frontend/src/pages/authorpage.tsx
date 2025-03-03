import { useQuery } from '@tanstack/react-query';
import { handleError, handleSuccess } from '../utils';
import { AuthorPublicWithPoems } from '../client/types.gen';
import { Loading } from '../components/Loading';
import { authorsReadAuthorById } from '../client/sdk.gen';
import { useParams } from 'react-router';

function getAuthorQuery(authorId: string) {
  return {
    queryKey: ['author', authorId],
    queryFn: async () => {
      const result = await authorsReadAuthorById(
        {
          path: {author_id: authorId},
        }
      );

      if (result.error) {
        throw result.error;
      }

      return result.data;
    }
  }
}

export function AuthorPage() {
  const params = useParams();
  const authorId = params.id;

  const { isPending, isError, isSuccess, data, error } = useQuery({
    ...getAuthorQuery(authorId!),
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