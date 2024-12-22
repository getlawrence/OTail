import React from 'react';
import { styles } from './styles';
import { LAYOUT_CONFIG, PIPELINE_SECTIONS } from './constants';
import type { PipelineType } from './types';

interface FlowSectionProps {
  type: PipelineType;
  index: number;
}

export const FlowSection: React.FC<FlowSectionProps> = ({ type, index }) => {
  const sectionConfig = PIPELINE_SECTIONS[type];
  const topPosition = (LAYOUT_CONFIG.SECTION_HEIGHT * index) / 3;

  return (
    <>
      <div
        className={`section ${type}`}
        style={{
          ...styles.sectionStyles.divider,
          top: `${topPosition}px`,
          background: sectionConfig.background,
        }}
      />
      <div
        style={{
          ...styles.sectionStyles.label,
          top: topPosition + 10,
          background: sectionConfig.labelBackground,
        }}
      >
        {sectionConfig.label}
      </div>
    </>
  );
};
