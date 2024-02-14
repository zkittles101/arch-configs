import ControlsTabsModule from './Tabs.js';
import ControlsTooltipModule from './Tooltip.js';

function ControlsModule(fvdSynchronizer) {
  fvdSynchronizer.Controls = {};
  new ControlsTabsModule(fvdSynchronizer);
  new ControlsTooltipModule(fvdSynchronizer);
}

export default ControlsModule;
