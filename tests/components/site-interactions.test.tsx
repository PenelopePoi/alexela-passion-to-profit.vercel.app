import React from 'react';
import {render,screen,fireEvent,waitFor,within} from '@testing-library/react';
import {beforeEach,describe,it,expect,vi} from 'vitest';
import SmartNav from '../../components/SmartNav';
import StudioLanding from '../../components/StudioLanding';
import {useStudioAction,dispatchStudioAction} from '../../components/studio-actions';
const defaults={onNavigate:vi.fn(),onScrollToPricing:vi.fn(),scrollY:1000,hasInteractedSinceAutoNav:false,onAutoNavFired:vi.fn()};
beforeEach(()=>{sessionStorage.clear();vi.clearAllMocks();HTMLElement.prototype.scrollIntoView=vi.fn();});
function Actions({save,exportProject}:{save:()=>void;exportProject:()=>void}){useStudioAction('save',save);useStudioAction('export',exportProject);return null;}
describe('site controls',()=>{
 it('routes every floating dashboard action to an actual handler and cleans up listeners',()=>{
  const save=vi.fn(),exportProject=vi.fn(),navigate=vi.fn();
  const view=render(<><Actions save={save} exportProject={exportProject}/><SmartNav {...defaults} currentView="dashboard" onNavigate={navigate}/></>);
  fireEvent.click(screen.getByRole('button',{name:'Save'}));
  fireEvent.click(screen.getByRole('button',{name:'Export JSON'}));
  fireEvent.click(screen.getByRole('button',{name:'New Project'}));
  expect(save).toHaveBeenCalledTimes(1);expect(exportProject).toHaveBeenCalledTimes(1);expect(navigate).toHaveBeenCalledWith('intake');
  view.unmount();dispatchStudioAction('save');expect(save).toHaveBeenCalledTimes(1);
 });
 it('saves intake progress and targets the actual pricing section',()=>{
  const save=vi.fn();const {rerender}=render(<><Actions save={save} exportProject={()=>{}}/><SmartNav {...defaults} currentView="intake"/></>);
  fireEvent.click(screen.getByRole('button',{name:'Save Progress'}));expect(save).toHaveBeenCalledTimes(1);
  rerender(<SmartNav {...defaults} currentView="landing"/>);
  fireEvent.click(screen.getByRole('button',{name:'See Pricing'}));expect(defaults.onScrollToPricing).toHaveBeenCalledTimes(1);
 });
 it('opens and closes the mobile menu, selects a package, updates extras and exposes copy failure',async()=>{
  Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:vi.fn().mockRejectedValue(new Error('blocked'))}});
  const consult=vi.fn(),chat=vi.fn(),privacy=vi.fn();
  render(<StudioLanding onConsult={consult} onChat={chat} onPrivacy={privacy} onSample={()=>{}}/>);
  fireEvent.click(screen.getByRole('button',{name:'Open menu'}));
  fireEvent.click(within(screen.getByRole('navigation',{name:'Mobile navigation'})).getByRole('link',{name:'Portfolio'}));
  expect(screen.queryByRole('navigation',{name:'Mobile navigation'})).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:/04 Digital launch/}));
  expect(screen.getByRole('combobox',{name:'1. Choose your package'})).toHaveValue('site');
  fireEvent.click(screen.getByRole('checkbox',{name:/Logo background cleanup/}));
  expect(screen.getByRole('complementary')).toHaveTextContent('$1,220');
  fireEvent.click(screen.getByRole('button',{name:'Copy estimate'}));
  await waitFor(()=>expect((screen.getByRole('textbox',{name:'Estimate to copy'}) as HTMLTextAreaElement).value).toContain('$1220'));
  fireEvent.click(screen.getByRole('button',{name:'Book a consultation'}));expect(consult).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button',{name:'Have another question?'}));expect(chat).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button',{name:'Privacy policy'}));expect(privacy).toHaveBeenCalledTimes(1);
 });
});
