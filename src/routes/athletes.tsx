import { createFileRoute } from '@tanstack/react-router'
import { pb, type AthleteExpanded } from '../lib/pocketbase'

export const Route = createFileRoute('/athletes')({
  loader: async () => {
    const athletes = await pb.collection('athletes').getList<AthleteExpanded>(1, 50, {
      sort: '-created',
      expand: 'country',
    })
    return { athletes }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { athletes } = Route.useLoaderData()

  console.log(athletes)

  return (
    <div>
      {athletes.items.length === 0 ? (
        <p>No athletes found</p>
      ) : (
        <ul>
          {athletes.items.map((athlete) => (
            <li key={athlete.id}>
              {athlete.expand?.country && ` ${athlete.expand.country.emoji}`} &nbsp;
              {athlete.name} {athlete.surname}
              {athlete.birthdate && ` - Born: ${new Date(athlete.birthdate).toUTCString()}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
