import { GenericNicheWebProvider } from './genericNicheWebProvider.js';

function cfg(name: string, label: string, baseUrl: string, searchPath = '/jobs', queryParam = 'q', locationParam = 'location') {
  return { name, label, baseUrl, searchPath, queryParam, locationParam, companyFallback: label };
}

export class TechnojobsProvider extends GenericNicheWebProvider { constructor() { super(cfg('technojobs', 'Technojobs', 'https://www.technojobs.co.uk', '/jobsearch/jobs', 'keywords', 'locations')); } }
export class TheITJobBoardProvider extends GenericNicheWebProvider { constructor() { super(cfg('theitjobboard', 'The IT Job Board', 'https://www.theitjobboard.co.uk', '/jobs', 'keywords', 'location')); } }
export class HarnhamProvider extends GenericNicheWebProvider { constructor() { super(cfg('harnham', 'Harnham', 'https://www.harnham.com', '/jobs', 'keyword', 'location')); } }
export class DataCareerProvider extends GenericNicheWebProvider { constructor() { super(cfg('datacareer', 'DataCareer', 'https://www.datacareer.co.uk', '/jobs', 'q', 'location')); } }
export class WorkInStartupsProvider extends GenericNicheWebProvider { constructor() { super(cfg('workinstartups', 'Work In Startups', 'https://www.workinstartups.com', '/job-board/jobs', 'keywords', 'location')); } }
export class SiliconMilkroundaboutProvider extends GenericNicheWebProvider { constructor() { super(cfg('siliconmilkroundabout', 'Silicon Milkroundabout', 'https://www.siliconmilkroundabout.com', '/jobs', 'q', 'location')); } }
export class DiceUKProvider extends GenericNicheWebProvider { constructor() { super(cfg('dice-uk', 'Dice UK', 'https://www.dice.com', '/jobs', 'q', 'location')); } }

export class GAAPwebProvider extends GenericNicheWebProvider { constructor() { super(cfg('gaapweb', 'GAAPweb', 'https://www.gaapweb.com', '/jobs', 'keywords', 'location')); } }
export class CityJobsProvider extends GenericNicheWebProvider { constructor() { super(cfg('cityjobs', 'CityJobs', 'https://www.cityjobs.com', '/jobs', 'keywords', 'location')); } }
export class BarclaySimpsonProvider extends GenericNicheWebProvider { constructor() { super(cfg('barclaysimpson', 'Barclay Simpson', 'https://www.barclaysimpson.com', '/jobs', 'keyword', 'location')); } }

export class HealthjobsProvider extends GenericNicheWebProvider { constructor() { super(cfg('healthjobs', 'Healthjobs.co.uk', 'https://www.healthjobs.co.uk', '/jobs', 'keywords', 'location')); } }
export class NursesProvider extends GenericNicheWebProvider { constructor() { super(cfg('nurses', 'Nurses.co.uk', 'https://www.nurses.co.uk', '/jobs', 'keywords', 'location')); } }
export class BMJCareersProvider extends GenericNicheWebProvider { constructor() { super(cfg('bmj-careers', 'BMJ Careers', 'https://careers.bmj.com', '/jobs', 'keywords', 'location')); } }
export class TracJobsProvider extends GenericNicheWebProvider { constructor() { super(cfg('trac-jobs', 'trac.jobs', 'https://www.jobs.nhs.uk', '/candidate/search/results', 'keyword', 'location')); } }
export class NHSProfessionalsProvider extends GenericNicheWebProvider { constructor() { super(cfg('nhs-professionals', 'NHS Professionals', 'https://www.nhsprofessionals.nhs.uk', '/jobs', 'keywords', 'location')); } }

export class TesJobsProvider extends GenericNicheWebProvider { constructor() { super(cfg('tes-jobs', 'Tes Jobs', 'https://www.tes.com', '/jobs/search', 'keywords', 'locations')); } }
export class TeachingVacanciesProvider extends GenericNicheWebProvider { constructor() { super(cfg('teaching-vacancies', 'Teaching Vacancies', 'https://teaching-vacancies.service.gov.uk', '/jobs', 'keyword', 'location')); } }
export class EteachProvider extends GenericNicheWebProvider { constructor() { super(cfg('eteach', 'Eteach', 'https://www.eteach.com', '/jobs', 'keywords', 'location')); } }
export class FEjobsProvider extends GenericNicheWebProvider { constructor() { super(cfg('fejobs', 'FEjobs', 'https://www.fejobs.com', '/jobs', 'keywords', 'location')); } }
export class TimesHigherEducationProvider extends GenericNicheWebProvider { constructor() { super(cfg('timeshighereducation', 'Times Higher Education Jobs', 'https://www.timeshighereducation.com', '/unijobs/listings', 'keywords', 'location')); } }

export class EngineeringJobsProvider extends GenericNicheWebProvider { constructor() { super(cfg('engineeringjobs', 'Engineering Jobs', 'https://www.engineeringjobs.co.uk', '/jobs', 'keywords', 'location')); } }
export class ICERecruitProvider extends GenericNicheWebProvider { constructor() { super(cfg('ice-recruit', 'ICE Recruit', 'https://www.icerecruit.com', '/jobs', 'keywords', 'location')); } }
export class JustEngineersProvider extends GenericNicheWebProvider { constructor() { super(cfg('justengineers', 'Just Engineers', 'https://www.justengineers.net', '/jobs', 'keywords', 'location')); } }
export class TheManufacturerJobsProvider extends GenericNicheWebProvider { constructor() { super(cfg('themanufacturerjobs', 'The Manufacturer Jobs', 'https://jobs.themanufacturer.com', '/jobs', 'keywords', 'location')); } }
export class FawkesReeceProvider extends GenericNicheWebProvider { constructor() { super(cfg('fawkesreece', 'Fawkes & Reece', 'https://www.fawkesandreece.co.uk', '/jobs', 'keyword', 'location')); } }
export class PropertyWeekJobsProvider extends GenericNicheWebProvider { constructor() { super(cfg('propertyweekjobs', 'Property Week Jobs', 'https://jobs.propertyweek.com', '/jobs', 'keywords', 'location')); } }
export class IWFMJobsProvider extends GenericNicheWebProvider { constructor() { super(cfg('iwfmjobs', 'IWFM Jobs', 'https://jobs.iwfm.org.uk', '/jobs', 'keywords', 'location')); } }

export class CIPSJobsProvider extends GenericNicheWebProvider { constructor() { super(cfg('cips-jobs', 'CIPS Procurement & Supply Jobs', 'https://jobs.cips.org', '/jobs', 'keywords', 'location')); } }
export class SupplyChainOnlineProvider extends GenericNicheWebProvider { constructor() { super(cfg('supplychainonline', 'SupplyChainOnline', 'https://www.supplychainonline.co.uk', '/jobs', 'keywords', 'location')); } }
export class DriverHireProvider extends GenericNicheWebProvider { constructor() { super(cfg('driverhire', 'Driver Hire', 'https://www.driverhire.co.uk', '/jobs', 'keywords', 'location')); } }

export class CatererProvider extends GenericNicheWebProvider { constructor() { super(cfg('caterer', 'Caterer.com', 'https://www.caterer.com', '/jobs', 'keywords', 'location')); } }
export class RetailChoiceProvider extends GenericNicheWebProvider { constructor() { super(cfg('retailchoice', 'RetailChoice.com', 'https://www.retailchoice.com', '/jobs', 'keywords', 'location')); } }
export class HoscoProvider extends GenericNicheWebProvider { constructor() { super(cfg('hosco', 'Hosco', 'https://www.hosco.com', '/en/jobs', 'q', 'location')); } }
export class CMTravelProvider extends GenericNicheWebProvider { constructor() { super(cfg('cmtravel', 'C&M Travel Recruitment', 'https://www.candm.co.uk', '/jobs', 'keywords', 'location')); } }
export class FashionJobsUKProvider extends GenericNicheWebProvider { constructor() { super(cfg('fashionjobs-uk', 'FashionJobs UK', 'https://uk.fashionjobs.com', '/jobs', 'keywords', 'location')); } }

export class CivilServiceJobsProvider extends GenericNicheWebProvider { constructor() { super(cfg('civilservicejobs', 'Civil Service Jobs', 'https://www.civilservicejobs.service.gov.uk', '/csr/jobs.cgi', 'keyword', 'postcode')); } }
export class CharityJobProvider extends GenericNicheWebProvider { constructor() { super(cfg('charityjob', 'CharityJob', 'https://www.charityjob.co.uk', '/jobs', 'keywords', 'location')); } }
export class EnvironmentJobProvider extends GenericNicheWebProvider { constructor() { super(cfg('environmentjob', 'Environmentjob.co.uk', 'https://www.environmentjob.co.uk', '/jobs', 'q', 'location')); } }
export class GreenJobsProvider extends GenericNicheWebProvider { constructor() { super(cfg('greenjobs', 'GreenJobs', 'https://www.greenjobs.co.uk', '/jobs', 'keywords', 'location')); } }
export class FarmingUKJobsProvider extends GenericNicheWebProvider { constructor() { super(cfg('farmingukjobs', 'Farming UK Jobs', 'https://www.farminguk.com', '/jobs', 'keywords', 'location')); } }

export class TotallyLegalProvider extends GenericNicheWebProvider { constructor() { super(cfg('totallylegal', 'TotallyLegal', 'https://www.totallylegal.com', '/jobs', 'keywords', 'location')); } }
export class LawGazetteJobsProvider extends GenericNicheWebProvider { constructor() { super(cfg('lawgazettejobs', 'Law Gazette Jobs', 'https://jobs.lawgazette.co.uk', '/jobs', 'keywords', 'location')); } }
export class TheLawyerJobsProvider extends GenericNicheWebProvider { constructor() { super(cfg('thelawyerjobs', 'The Lawyer Jobs', 'https://jobs.thelawyer.com', '/jobs', 'keywords', 'location')); } }

export class TargetJobsProvider extends GenericNicheWebProvider { constructor() { super(cfg('targetjobs', 'TARGETjobs', 'https://targetjobs.co.uk', '/jobs', 'keywords', 'location')); } }
export class ProspectsProvider extends GenericNicheWebProvider { constructor() { super(cfg('prospects', 'Prospects', 'https://www.prospects.ac.uk', '/graduate-jobs', 'keyword', 'location')); } }
export class MilkroundProvider extends GenericNicheWebProvider { constructor() { super(cfg('milkround', 'Milkround', 'https://www.milkround.com', '/jobs', 'keywords', 'location')); } }
export class GradcrackerProvider extends GenericNicheWebProvider { constructor() { super(cfg('gradcracker', 'Gradcracker', 'https://www.gradcracker.com', '/search/all-disciplines/jobs', 'keywords', 'location')); } }
export class StudentCircusProvider extends GenericNicheWebProvider { constructor() { super(cfg('studentcircus', 'Student Circus', 'https://www.studentcircus.com', '/jobs', 'keywords', 'location')); } }
export class IndeedFlexProvider extends GenericNicheWebProvider { constructor() { super(cfg('indeedflex', 'Indeed Flex', 'https://www.indeedflex.co.uk', '/jobs', 'keywords', 'location')); } }
