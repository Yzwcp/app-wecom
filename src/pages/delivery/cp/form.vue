<template>
	<xn-form-container title="发货任务" :visible="visible" :destroy-on-close="true" @close="onClose" width="900px">
		<a-form ref="formRef" :model="formData" :rules="formRules" layout="vertical">
			<a-form-item label="客户（门店）" name="customerId">
				<a-input
					:value="selectedCustomerName"
					placeholder="请选择客户，选后收货人信息未填时自动带出"
					readonly
					style="cursor: pointer"
					@click="customerSelectVisible = true"
				>
					<template #suffix>
						<div
							v-if="formData.customerId"
							type="link"
							style="font-size: 12px"
							@click.stop="onClearCustomer"
						>
							清除
						</div>
					</template>
				</a-input>
			</a-form-item>
			<a-form-item label="是否需要回寄设备" name="needReturnDevice">
				<a-select
					v-model:value="formData.needReturnDevice"
					placeholder="请选择"
					:options="[
						{ label: '是', value: '1' },
						{ label: '否', value: '2' }
					]"
					allow-clear
				/>
			</a-form-item>
			<a-form-item label="收货人姓名" name="receiverName">
				<a-input v-model:value="formData.receiverName" placeholder="不填则按客户门店信息带出" allow-clear />
			</a-form-item>

			<a-form-item label="收货人电话" name="receiverPhone">
				<a-input v-model:value="formData.receiverPhone" placeholder="不填则按客户门店信息带出" allow-clear />
			</a-form-item>
			<a-form-item label="收货地址" name="receiverAddress">
				<a-textarea
					v-model:value="formData.receiverAddress"
					placeholder="不填则按客户门店地址带出（省+市+详细地址）"
					:rows="2"
					allow-clear
				/>
			</a-form-item>
			<a-form-item label="发货人员" name="deliveryPersonId">
				<a-select
					v-model:value="formData.deliveryPersonId"
					placeholder="请选择发货人员"
					:options="deliveryPersonOptions"
					:field-names="{ label: 'name', value: 'id' }"
					allow-clear
					show-search
					:filter-option="(input, option) => option.name && option.name.includes(input)"
				/>
			</a-form-item>

			<template v-if="isDeliveryPerson">
				<a-form-item label="物流单号" name="logisticsNo">
					<a-input v-model:value="formData.logisticsNo" placeholder="请输入物流单号" allow-clear />
				</a-form-item>
				<a-form-item label="物流公司" name="logisticsCompany">
					<a-input v-model:value="formData.logisticsCompany" placeholder="请输入物流公司" allow-clear />
				</a-form-item>
			</template>
			<a-form-item label="备注" name="remark">
				<a-textarea v-model:value="formData.remark" placeholder="请输入备注" :rows="2" allow-clear />
			</a-form-item>
			<!-- 发货清单 -->
			<a-divider>发货清单</a-divider>
			<div v-for="(item, index) in formData.itemList" :key="index" class="item-row">
				<a-row :gutter="12" align="middle">
					<a-col :span="6">
						<a-form-item :name="['itemList', index, 'goodsId']">
							<a-select
								v-model:value="item.goodsId"
								placeholder="选择货品（选填）"
								:options="goodsOptions"
								:field-names="{ label: 'goodsName', value: 'id' }"
								show-search
								:filter-option="filterGoodsOption"
								allow-clear
								@change="(value) => onGoodsSelected(item, value)"
							/>
						</a-form-item>
					</a-col>
					<a-col :span="5">
						<a-form-item
							:name="['itemList', index, 'itemName']"
							:rules="[{ required: true, message: '请输入物品名称' }]"
						>
							<a-input
								v-model:value="item.itemName"
								:placeholder="item.goodsId ? '以货品档案为准' : '物品名称'"
								:disabled="!!item.goodsId"
							/>
						</a-form-item>
					</a-col>
					<a-col :span="4">
						<a-form-item :name="['itemList', index, 'spec']">
							<a-input
								v-model:value="item.spec"
								:placeholder="item.goodsId ? '以货品档案为准' : '规格型号'"
								:disabled="!!item.goodsId"
							/>
						</a-form-item>
					</a-col>
					<a-col :span="4">
						<a-form-item
							:name="['itemList', index, 'quantity']"
							:rules="[{ required: true, message: '请输入数量' }]"
						>
							<a-input-number
								v-model:value="item.quantity"
								placeholder="数量"
								:min="1"
								style="width: 100%"
							/>
						</a-form-item>
					</a-col>
					<a-col :span="3">
						<a-form-item :name="['itemList', index, 'unit']">
							<a-input v-model:value="item.unit" placeholder="单位" />
						</a-form-item>
					</a-col>
					<a-col :span="2">
						<a-button type="link" danger @click="removeItem(index)">
							<template #icon><delete-outlined /></template>
						</a-button>
					</a-col>
				</a-row>
			</div>
			<a-button type="dashed" block @click="addItem">
				<template #icon><plus-outlined /></template>
				添加物品
			</a-button>
		</a-form>
		<a-modal
			v-model:visible="customerSelectVisible"
			title="选择客户"
			width="1500px"
			:footer="null"
			:destroy-on-close="true"
			style="top: 20px"
		>
			<CustomerIndex select-mode @selected="onCustomerSelected" />
		</a-modal>
		<a-modal
			v-model:visible="constructionTaskSelectVisible"
			title="选择施工任务"
			width="1500px"
			:footer="null"
			:destroy-on-close="true"
			style="top: 20px"
		>
			<ConstructionIndex select-mode @selected="onConstructionTaskSelected" />
		</a-modal>
		<template #footer>
			<a-button style="margin-right: 8px" @click="onClose">关闭</a-button>
			<a-button type="primary" @click="onSubmit" :loading="submitLoading">保存</a-button>
		</template>
	</xn-form-container>
</template>

<script setup name="deliveryTaskForm">
import { ref, defineAsyncComponent } from 'vue'
import { message } from 'ant-design-vue'
import bizWjApi from '@/api/biz/bizWjApi'
import bizWjGoodsApi from '@/api/biz/bizWjGoodsApi'
import { cloneDeep } from 'lodash-es'
import { useGlobalStore } from '@/store/global'
import CustomerIndex from '@/views/biz/company/customer/index.vue'
const ConstructionIndex = defineAsyncComponent(() => import('@/views/biz/company/construction/index.vue'))
const globalStore = useGlobalStore()

const emit = defineEmits({ successful: null })
let formRef = ref()
let formData = ref({ itemList: [] })
let visible = ref(false)
let submitLoading = ref(false)
let constructionTaskSelectVisible = ref(false)
let selectedConstructionTaskName = ref('')
let customerSelectVisible = ref(false)
let selectedCustomerName = ref('')
let deliveryPersonOptions = ref([])
let goodsOptions = ref([])
let isEdit = ref(false)
const userInfo = computed(() => globalStore.userInfo)
// 是否为发货人员角色
const isDeliveryPerson = computed(() => userInfo.value?.roleCodeList?.includes('WJ_DELIVERY_PERSON'))

const formRules = {}

const loadDeliveryPersonList = () => {
	bizWjApi.wjDeliveryTaskDeliveryPersonList({}).then((data) => {
		deliveryPersonOptions.value = data || []
	})
}

// 加载货品下拉
const loadGoodsOptions = () => {
	bizWjGoodsApi.wjGoodsList().then((data) => {
		goodsOptions.value = data || []
	})
}
const filterGoodsOption = (input, option) => {
	return option.goodsName && option.goodsName.toLowerCase().indexOf(input.toLowerCase()) >= 0
}
// 选中货品后回填名称/规格（服务端以货品档案为准，前端展示同步）
const onGoodsSelected = (item, goodsId) => {
	const goods = goodsOptions.value.find((g) => g.id === goodsId)
	if (goods) {
		item.itemName = goods.goodsName
		item.spec = goods.goodsModel
	} else {
		item.itemName = ''
		item.spec = ''
	}
}

const onCustomerSelected = (row) => {
	formData.value.customerId = row.id
	selectedCustomerName.value = row.storeName
	customerSelectVisible.value = false
	// 拉取门店基础详情回填收货人信息：新增时直接回填覆盖；编辑时仅回填为空的项
	bizWjApi.wjStoreBaseDetail({ id: row.id }).then((data) => {
		if (!data) {
			return
		}
		if (isEdit.value) {
			if (!formData.value.receiverName && data.contactName) {
				formData.value.receiverName = data.contactName
			}
			if (!formData.value.receiverPhone && data.contactPhone) {
				formData.value.receiverPhone = data.contactPhone
			}
			if (!formData.value.receiverAddress && data.address) {
				formData.value.receiverAddress = data.address
			}
		} else {
			if (data.contactName) {
				formData.value.receiverName = data.contactName
			}
			if (data.contactPhone) {
				formData.value.receiverPhone = data.contactPhone
			}
			if (data.address) {
				formData.value.receiverAddress = data.address
			}
		}
	})
}

const onClearCustomer = () => {
	formData.value.customerId = undefined
	selectedCustomerName.value = ''
}

const onOpen = (record) => {
	visible.value = true
	loadDeliveryPersonList()
	loadGoodsOptions()
	isEdit.value = !!(record && record.id)
	if (record && record.id) {
		bizWjApi.wjDeliveryTaskDetail({ id: record.id }).then((data) => {
			formData.value = cloneDeep(data)
			if (!formData.value.itemList || formData.value.itemList.length === 0) {
				formData.value.itemList = []
			}
			selectedConstructionTaskName.value = data.constructionTaskNo || ''
			selectedCustomerName.value = data.customerName || ''
		})
	} else {
		formData.value = { itemList: [] }
		selectedConstructionTaskName.value = ''
		selectedCustomerName.value = ''
	}
}

const onClose = () => {
	visible.value = false
	isEdit.value = false
	selectedConstructionTaskName.value = ''
	selectedCustomerName.value = ''
}

const onConstructionTaskSelected = (row) => {
	formData.value.constructionTaskId = row.id
	selectedConstructionTaskName.value = row.taskNo || row.id
	constructionTaskSelectVisible.value = false
}

const onClearConstructionTask = () => {
	formData.value.constructionTaskId = undefined
	selectedConstructionTaskName.value = ''
}

const addItem = () => {
	if (!formData.value.itemList) {
		formData.value.itemList = []
	}
	formData.value.itemList.push({
		goodsId: undefined,
		itemName: '',
		spec: '',
		quantity: 1,
		unit: ''
	})
}

const removeItem = (index) => {
	formData.value.itemList.splice(index, 1)
}

const onSubmit = () => {
	formRef.value.validate().then(() => {
		submitLoading.value = true
		const params = { ...formData.value }
		const apiMethod = params.id ? 'wjDeliveryTaskEdit' : 'wjDeliveryTaskAdd'
		bizWjApi[apiMethod](params)
			.then(() => {
				message.success('保存成功')
				emit('successful')
				onClose()
			})
			.finally(() => {
				submitLoading.value = false
			})
	})
}

defineExpose({ onOpen })
</script>
<style scoped lang="less">
.item-row {
	background: #fafafa;
	padding: 12px;
	border-radius: 6px;
	margin-bottom: 8px;
}
</style>
