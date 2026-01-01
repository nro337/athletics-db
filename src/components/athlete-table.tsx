import { useMemo } from 'react';
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef, //if using TypeScript (optional, but recommended)
} from 'mantine-react-table';
import type { AthleteExpanded } from '../lib/pocketbase';

export default function AthleteTable({data}: {data: AthleteExpanded[]}) {
  //column definitions - strongly typed if you are using TypeScript (optional, but recommended)
  const columns = useMemo<MRT_ColumnDef<AthleteExpanded>[]>(
    () => [
      {
        accessorFn: (originalRow) => originalRow.name, //alternate way
        id: 'name', //id required if you use accessorFn instead of accessorKey
        header: 'First Name',
        // Header: <i style={{ color: 'red' }}>Age</i>, //optional custom markup
      },
      {
        accessorFn: (originalRow) => originalRow.surname,
        id: 'surname',
        header: 'Surname',
      },
      {
        accessorFn: (originalRow) => originalRow.expand ? `${originalRow?.expand.country.emoji} ${originalRow.expand.country.name}` : 'N/A',
        id: 'countryEmoji',
        header: 'Country',
      },
      {
        accessorFn: (originalRow) => originalRow.expand ? originalRow.expand?.primary_events.map(event => event.name).join(', ') : 'N/A',
        id: 'primaryEvents',
        header: 'Primary Events',
      }
    ],
    [],
  );

  //pass table options to useMantineReactTable
  const table = useMantineReactTable({
    columns,
    data, //must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    enableRowSelection: true, //enable some features
    enableColumnOrdering: true,
    enableGlobalFilter: false, //turn off a feature
  });

  //note: you can also pass table options as props directly to <MantineReactTable /> instead of using useMantineReactTable
  //but that is not recommended and will likely be deprecated in the future
  return <MantineReactTable table={table} />;
}