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
  expect(screen.getByAltText('DNA Remodels full artwork')).toHaveAttribute('src','/portfolio/dna-remodels-business-card.webp');
  fireEvent.click(screen.getByRole('button',{name:'Close project'}));
  expect(trigger).toHaveFocus();
 });
 it('navigates within a category and sends the selected project into intake',()=>{
  HTMLDialogElement.prototype.showModal=vi.fn(function(this:HTMLDialogElement){this.setAttribute('open','');});
  render(<PortfolioGallery/>);
  fireEvent.click(screen.getByRole('button',{name:'Business Cards'}));
  fireEvent.click(screen.getByRole('button',{name:'View AleXelA — services business card'}));
  fireEvent.click(screen.getByRole('button',{name:'Next project'}));
  expect(screen.getByRole('dialog',{name:'Coquina Ridge'})).toBeInTheDocument();
  fireEvent.keyDown(screen.getByRole('dialog'),{key:'ArrowLeft'});
  expect(screen.getByRole('dialog',{name:'AleXelA — services business card'})).toBeInTheDocument();
  const destination=new URL(screen.getByRole('link',{name:'Request a similar project'}).getAttribute('href')!,'https://example.com');
  expect(destination.searchParams.get('package')).toBe('custom');
  expect(destination.searchParams.get('product')).toBe('Business Cards — AleXelA — services business card');
 });

 it('honors the marked removals and before/after artwork assignments',()=>{
  for(const removed of ['alexela-sacred-gold-logo.webp','alexela-sacred-dark-logo.webp','alexela-horizontal-logo.webp','dna-remodels-logo-concept.webp','cristinas-cleaning-logo.png','work-29.jpg','alexela-studio-promotional-flyer.webp','work-06.jpg']) expect(portfolioProjects.some(p=>p.image.endsWith(removed))).toBe(false);
  expect(portfolioProjects.find(p=>p.image.endsWith('cracked-to-classy-logo.png'))?.stage).toBe('Before');
  expect(portfolioProjects.find(p=>p.image.endsWith('work-16.jpg'))?.stage).toBe('After');
  expect(portfolioProjects.find(p=>p.image.endsWith('rods-ebike-logo.png'))?.stage).toBe('Before');
  for(const image of ['work-30.jpg','work-31.jpg']) expect(portfolioProjects.find(p=>p.image.endsWith(image))?.stage).toBe('After');
  expect(portfolioProjects.find(p=>p.image.endsWith('work-08.jpg'))?.stage).toBe('Before');
 });
 it('opens the original before and after artwork together across sections',()=>{
  HTMLDialogElement.prototype.showModal=vi.fn(function(this:HTMLDialogElement){this.setAttribute('open','');});
  render(<PortfolioGallery/>);
  fireEvent.click(screen.getByRole('button',{name:'Logos',exact:true}));
  fireEvent.click(screen.getByRole('button',{name:'View Rod’s E-Bike Repair',exact:true}));
  const comparison=screen.getByRole('group',{name:'Before and after artwork'});
  fireEvent.click(within(comparison).getByRole('button',{name:'After: Rod’s E-Bike Repair flyer'}));
  expect(screen.getByAltText('Rod’s E-Bike Repair flyer full artwork')).toHaveAttribute('src','/gallery/work-31.jpg');
  expect(screen.getByRole('button',{name:'Next project'})).toBeDisabled();
 });

});
