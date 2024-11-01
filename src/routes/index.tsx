import { createFileRoute } from '@tanstack/react-router'
import { EditorContainer } from '@/libs/editor'
import { z } from 'zod'
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: RouteComponent,
  validateSearch: z.object({
    entry: z.string().optional(),
  })
})

function RouteComponent() {
  const { entry } = Route.useSearch();

  if (!entry) {
    return (
      <div className='home-container'>
        <div className='mb-8'>
          <h1 className='text-3xl mb-2 font-bold'>Block Base</h1>
          <p className='text-xl text-muted-foreground'>Write with ease</p>
        </div>
        <div className='mb-8'>
          <h4 className='text-xl mb-2'>Start</h4>
          <ul>
            <li className='mb-1'>
              <Link className='mb-1'>New Document</Link>
            </li>
            <li>
              <Link className=''>Open Draft</Link>
            </li>
          </ul>
        </div>
        <div className='mb-8'>
          <h4 className='text-xl mb-2'>Recent</h4>
          <div>
            <p className=''>Empty</p>
          </div>
        </div>

      </div>
    )
  }

  return <EditorContainer />
}
