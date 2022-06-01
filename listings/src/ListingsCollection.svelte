<script>
	// @ts-ignore
	import { paginate, LightPaginationNav } from 'svelte-paginate';
	export let listings = [];
	document.getElementById('listingsContainer').innerHTML = '';

	let items = listings;
	let currentPage = 1;
	let pageSize = 5;
	$: paginatedItems = paginate({ items, pageSize, currentPage });
</script>

{#each paginatedItems as listing}

	<a href="/prophouse/listing_view/{listing.id}" class="flex flex-col md:w-6/12 items-center my-1 bg-white rounded-lg border shadow-md md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
		<img class="object-cover w-full h-96 rounded-t-lg md:h-auto md:w-48 md:rounded-none md:rounded-l-lg" src="https://propertyhouseza.b-cdn.net/s_{listing.displayimagefilepath}" alt="{listing.address} image">
		<div class="flex flex-col justify-between p-4 leading-normal">
			<h5 class="mb-2 text-2xl font-bold tracking-tight text-sky-800 dark:text-white">R {listing.marketing_list_price.toLocaleString(undefined, {minimumFractionDigits: 2})}</h5>
			<h3 class="mb-3 font-bold text-gray-700 dark:text-gray-400">{listing.suburb ? listing.suburb : listing.city}</h3>
			<p class="mb-3 font-normal text-gray-700 dark:text-gray-400">{listing.marketing_listing_heading}</p>
			<p>
				{#if  (listing.bedrooms > 0) && (listing.bedrooms != null) }
					<i class="fa fa-bed text-gray-600 mx-1" aria-hidden="true"></i><span class="mx-1 text-gray-600">{listing.bedrooms}</span>
				{/if}
				{#if  (listing.bathrooms > 0) && (listing.bathrooms != null) }
					<i class="fa fa-bath text-gray-600 mx-1" aria-hidden="true"></i><span class="mx-1 text-gray-600">{listing.bathrooms}</span>
				{/if}
				{#if  (listing.garages > 0) && (listing.garages != null) }
					<i class="fa fa-car text-gray-600 mx-1" aria-hidden="true"></i><span class="mx-1 text-gray-600">{listing.garages}</span>
				{/if}
			</p>
		</div>
	</a>
	<!-- marketing_listing_heading -->
{/each}

<div>
	<LightPaginationNav
	totalItems="{items.length}"
	pageSize="{pageSize}"
	currentPage="{currentPage}"
	limit="{1}"
	showStepOptions="{true}"
	on:setPage="{(e) => currentPage = e.detail.page}"
  />
</div>
