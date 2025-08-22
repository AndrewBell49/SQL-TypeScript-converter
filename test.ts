import singleline from "singleline"

export interface UserQueryParams {
  scenario_uuid: number;
  ClientName: string;
  Network: string;
}

export const UserQuery = ({
  scenario_uuid,
  ClientName,
  Network, }: UserQueryParams) => {
  return singleline(`with rate_sources as 
(select distinct Global_Network, SelectedRateSource from prod.lookups.global_routing_scenarioratesources 
where FeeType = 'Switch' and scenario_uuid = '${scenario_uuid}'),

nyce_switch_tier as 
(select Global_Network, Global_NYCESwitchTier_From_scenario_uuid from prod.lookups.global_routing_scenario_nyceswitchtier 
where scenario_uuid = '${scenario_uuid}'),

payment_types as
(select distinct Global_PaymentType, Global_PINlessChannel from prod.deltalive.global_routing_fact_gold inner join rate_sources 
using (Global_Network) where Global_ClientName = '${ClientName}'),

published as 
(
  select
Global_PaymentType,
Global_PINlessChannel,
explode(array('Regulated','Unregulated')) as Global_Regulation,
Global_Network,
Global_NYCESwitchTier,
SWPercentage as Published_SWPercentage,
SWPerItem as Published_SWPerItem,
SWCap as Published_SWCap,
PreAuthPercentage as Published_PreAuthPercentage,
PreAuthPerItem as Published_PreAuthPerItem,
PreAuthCap as Published_PreAuthCap,
PreAuthCompletionPercentage as Published_PreAuthCompletionPercentage,
PreAuthCompletionPerItem as Published_PreAuthCompletionPerItem,
PreAuthCompletionCap as Published_PreAuthCompletionCap,
SelectedRateSource
from prod.lookups.global_publishedrates_switchfees
inner join rate_sources using 
(Global_Network)
inner join payment_types using 
(Global_PaymentType, Global_PINlessChannel)
left join nyce_switch_tier using
(Global_Network)
where Global_NYCESwitchTier = Global_NYCESwitchTier_From_scenario_uuid or Global_Network != 'NYCE'
or (Global_NYCESwitchTier_From_scenario_uuid is null and Global_NYCESwitchTier = '50,001-500,000')
order by 1,2,3,4),

passthrough as 
(
  select
Global_PaymentType,
Global_PINlessChannel,
Global_Regulation,
Global_Network,
SWPercentage as Passthrough_SWPercentage,
SWPerItem as Passthrough_SWPerItem,
SWCap as Passthrough_SWCap
from prod.lookups.global_passthroughrates_switchfees
inner join rate_sources using 
(Global_Network)
inner join payment_types using 
(Global_PaymentType, Global_PINlessChannel)
where Global_ClientName = '${ClientName}'
order by 1,2,3,4,5,6),

custom as 
(
  select
Global_PaymentType,
Global_PINlessChannel,
Global_Regulation,
Global_Network,
SWPercentage as Custom_SWPercentage,
SWPerItem as Custom_SWPerItem,
SWCap as Custom_SWCap,
PreAuthPercentage as Custom_PreAuthPercentage,
PreAuthPerItem as Custom_PreAuthPerItem,
PreAuthCap as Custom_PreAuthCap,
PreAuthCompletionPercentage as Custom_PreAuthCompletionPercentage,
PreAuthCompletionPerItem as Custom_PreAuthCompletionPerItem,
PreAuthCompletionCap as Custom_PreAuthCompletionCap,
ApplicableOnlyTo_Subtypes
from prod.lookups.global_customrates_switchfees
where scenario_uuid = '${scenario_uuid}'
order by 1,2,3,4,5,6)

select
Global_PaymentType,
Global_PINlessChannel,
Global_Regulation,
Global_Network,
Published_SWPercentage,
Published_SWPerItem,
Published_SWCap,
Published_PreAuthPercentage,
Published_PreAuthPerItem,
Published_PreAuthCap,
Published_PreAuthCompletionPercentage,
Published_PreAuthCompletionPerItem,
Published_PreAuthCompletionCap,
coalesce(Passthrough_SWPercentage,Published_SWPercentage) as Passthrough_SWPercentage,
coalesce(Passthrough_SWPerItem,Published_SWPerItem) as Passthrough_SWPerItem,
coalesce(Passthrough_SWCap,Published_SWCap) as Passthrough_SWCap,
Published_PreAuthPercentage as Published_PreAuthPercentage,
Published_PreAuthPerItem as Passthrough_PreAuthPerItem,
Published_PreAuthCap as Passthrough_PreAuthCap,
Published_PreAuthCompletionPercentage as Passthrough_PreAuthCompletionPercentage,
Published_PreAuthCompletionPerItem as Passthrough_PreAuthCompletionPerItem,
Published_PreAuthCompletionCap as Passthrough_PreAuthCompletionCap,
case when SelectedRateSource = 'Custom' and Custom_SWPercentage is not null then Custom_SWPercentage
     when SelectedRateSource = 'Pass-through' and Passthrough_SWPercentage is not null then Passthrough_SWPercentage
     else Published_SWPercentage
     end as Custom_SWPercentage,
case when SelectedRateSource = 'Custom' and Custom_SWPerItem is not null then Custom_SWPerItem
     when SelectedRateSource = 'Pass-through' and Passthrough_SWPerItem is not null then Passthrough_SWPerItem
     else Published_SWPerItem
     end as Custom_SWPerItem,
case when SelectedRateSource = 'Custom' and Custom_SWCap is not null then Custom_SWCap
     when SelectedRateSource = 'Pass-through' and Passthrough_SWCap is not null then Passthrough_SWCap
     else Published_SWCap
     end as Custom_SWCap,
case when SelectedRateSource = 'Custom' and Custom_PreAuthPercentage is not null then Custom_PreAuthPercentage
     else Published_PreAuthPercentage
     end as Custom_PreAuthPercentage,
case when SelectedRateSource = 'Custom' and Custom_PreAuthPerItem is not null then Custom_PreAuthPerItem
     else Published_PreAuthPerItem
     end as Custom_PreAuthPerItem,
case when SelectedRateSource = 'Custom' and Custom_PreAuthCap is not null then Custom_PreAuthCap
     else Published_PreAuthCap
     end as Custom_PreAuthCap,
case when SelectedRateSource = 'Custom' and Custom_PreAuthCompletionPercentage is not null then Custom_PreAuthCompletionPercentage
     else Published_PreAuthCompletionPercentage
     end as Custom_PreAuthCompletionPercentage,
case when SelectedRateSource = 'Custom' and Custom_PreAuthCompletionPerItem is not null then Custom_PreAuthCompletionPerItem
     else Published_PreAuthCompletionPerItem
     end as Custom_PreAuthCompletionPerItem,
case when SelectedRateSource = 'Custom' and Custom_PreAuthCompletionCap is not null then Custom_PreAuthCompletionCap
     else Published_PreAuthCompletionCap
     end as Custom_PreAuthCompletionCap,
ApplicableOnlyTo_Subtypes,
SelectedRateSource,
case when SelectedRateSource = 'Custom' and Custom_SWPerItem is not null then 'Custom'
     when SelectedRateSource in ('Custom','Pass-through') and Passthrough_SWPerItem is not null then 'Pass-through'
     else 'Published'
     end as Custom_AppliedRateSource
from published
left join passthrough using 
(Global_PaymentType,Global_PINlessChannel,Global_Regulation,Global_Network)
left join custom using 
(Global_PaymentType,Global_PINlessChannel,Global_Regulation,Global_Network)
where Global_Network = '${Network}'
order by Global_PaymentType,Global_PINlessChannel,Global_Network,Global_Regulation`
  )
}