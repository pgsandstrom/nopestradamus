import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import SettingsMenu from '../src/banner/settingsMenu.jsx';

describe('The settings menu', () => {
  it('shall render correctly!!!', () => {
    const wrapper = shallow(<SettingsMenu />);
    // console.log(wrapper.debug());
    expect(wrapper.find('.settings-menu')).to.have.length(1);
  });
});
