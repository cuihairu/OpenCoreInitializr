import React from 'react';
import type { DriverSupportInfo } from '@/types/driver-support';
import DriverCard from './DriverCard';

interface DriverListProps {
  drivers: DriverSupportInfo[];
  title: string;
}

const DriverList: React.FC<DriverListProps> = ({ drivers, title }) => {
  if (drivers.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold tracking-tight mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {drivers.map(driver => (
          <DriverCard key={driver.id} driver={driver} />
        ))}
      </div>
    </div>
  );
};

export default DriverList;