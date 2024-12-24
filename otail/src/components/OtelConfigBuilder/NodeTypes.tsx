import { styles } from './styles';
import ReceiverNode from './ReceiverNode';
import ProcessorNode from './ProcessorNode';
import ExporterNode from './ExporterNode';

export const nodeTypes = {
  receiver: (props: any) => (
    <div title={`Receiver: ${props.data.label}`}>
      <ReceiverNode {...props} handleStyle={styles.handleStyle} />
    </div>
  ),
  processor: (props: any) => (
    <div title={`Processor: ${props.data.label}`}>
      <ProcessorNode {...props} handleStyle={styles.handleStyle} />
    </div>
  ),
  exporter: (props: any) => (
    <div title={`Exporter: ${props.data.label}`}>
      <ExporterNode {...props} handleStyle={styles.handleStyle} />
    </div>
  ),
};
