import React from 'react';
import {render,screen,fireEvent,within} from '@testing-library/react';
import {describe,it,expect,vi} from 'vitest';
import {existsSync} from 'node:fs';
import {PortfolioGallery,portfolioProjects,portfolioSections} from '../../components/PortfolioGallery';
describe('sectioned portfolio',()=>{
 it('shows every requested section and uses existing, unique images',()=>{
  render(<PortfolioGallery/>);
  for(const name of portfolioSections) expect(screen.getByRole('region',{name})).toBeInTheDocument();
  expect(new Set(portfolioProjects.map(p=>p.image)).size).toBe(portfolioProjects.length);
  for(const project of portfolioProjects) expect(existsSync('public'+project.image)).toBe(true);
 });
 it('filters BMX separately from motorcycles and does not mislabel bike logos as decal sets',()=>{
  render(<PortfolioGallery/>);
  fireEvent.click(screen.getByRole('button',{name:'BMX Decal Sets'}));
  expect(screen.queryByRole('region',{name:'Logos'})).not.toBeInTheDocument();
  const region=screen.getByRole('region',{name:'BMX Decal Sets'});
  expect(within(region).queryByRole('img')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Motorcycle Decal Sets'}));
  expect(screen.getByRole('region',{name:'Motorcycle Decal Sets'})).toBeInTheDocument();
 });
 it('opens full artwork and returns keyboard focus to the selected image',()=>{
  HTMLDialogElement.prototype.showModal=vi.fn(function(this:HTMLDialogElement){this.setAttribute('open','');});
  HTMLDialogElement.prototype.close=vi.fn(function(this:HTMLDialogElement){this.removeAttribute('open');});
  render(<PortfolioGallery/>);
  const trigger=screen.getByRole('button',{name:'View DNA Remodels'});
  fireEvent.click(trigger);
  expect(screen.getByRole('dialog',{name:'DNA Remodels'})).toBeInTheDocument();
  expect(screen.getByAltText('DNA Remodels full artwork')).toHaveAttribute('src','/gallery/work-11.jpg');
  fireEvent.click(screen.getByRole('button',{name:'Close project'}));
  expect(trigger).toHaveFocus();
 });
});
